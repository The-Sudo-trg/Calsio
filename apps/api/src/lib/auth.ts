/**
 * auth.ts — phone OTP (WhatsApp-first, console in dev) + session tokens (§3 auth, D07).
 */

import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from './prisma';

const OTP_TTL_SECONDS = 300;
const MAX_OTP_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export const PhoneSchema = z.string().regex(/^\+91\d{10}$/, 'Use +91XXXXXXXXXX format');

function codeHash(phone: string, code: number, secret: string): string {
  return createHash('sha256').update(`${phone}:${code}:${secret}`).digest('hex');
}

/** Rate-limited OTP issuance. Dev: code prints to the server console (D07). */
export async function requestOtp(phone: string): Promise<
  { ok: true; devCode?: number } | { ok: false; reason: 'invalid_phone' | 'rate_limited' }
> {
  if (!PhoneSchema.safeParse(phone).success) return { ok: false, reason: 'invalid_phone' };

  const recent = await prisma.otpCode.count({
    where: { phone, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recent >= MAX_OTP_PER_WINDOW) return { ok: false, reason: 'rate_limited' };

  const code = Math.floor(100000 + Math.random() * 900000);
  const secret = process.env.OTP_SECRET ?? 'dev-otp-secret';
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: codeHash(phone, code, secret),
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    },
  });

  const isDevSecret = (process.env.WHATSAPP_TOKEN ?? '') === '';
  if (isDevSecret) {
    // Dev path (D07): real provider not configured — surface code in server logs.
    console.log(`\n[OTP][dev] ${phone} → ${code} (valid ${OTP_TTL_SECONDS}s)\n`);
    if (process.env.NODE_ENV === 'test' || process.env.CALSIO_ECHO_OTP === '1') {
      return { ok: true, devCode: code };
    }
  } else {
    // TODO(phase-3): WhatsApp Business API send (wa	template) — provider abstraction.
    console.warn('[OTP] WHATSAPP_TOKEN set but no provider implemented yet; dev fallback used');
    console.log(`[OTP][dev-fallback] ${phone} → ${code}`);
  }
  return { ok: true };
}

export type VerifyResult =
  | { ok: true; token: string; customerId: string; isNewCustomer: boolean }
  | { ok: false; reason: 'invalid_code' | 'too_many_attempts' | 'expired' | 'no_request' };

/** Verify OTP → upsert customer → mint session token. */
export async function verifyOtp(phone: string, code: number): Promise<VerifyResult> {
  const secret = process.env.OTP_SECRET ?? 'dev-otp-secret';
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) return { ok: false, reason: 'no_request' };
  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' };
  if (otp.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };

  if (otp.codeHash !== codeHash(phone, code, secret)) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: 'invalid_code' };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  const token = randomBytes(24).toString('hex');
  await prisma.session.create({
    data: {
      token,
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return { ok: true, token, customerId: customer.id, isNewCustomer: true };
}

/** Bearer-token auth for /api routes. */
export async function requireAuth(req: Request): Promise<
  { ok: true; customerId: string } | { ok: false }
> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false };
  const session = await prisma.session.findUnique({
    where: { token },
    select: { expiresAt: true, customerId: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return { ok: false };
  return { ok: true, customerId: session.customerId };
}
