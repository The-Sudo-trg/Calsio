import { requestOtp } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({ phone: z.string() });

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/** POST { phone } → OTP issued (dev: printed to server console). */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const bodyJson = BodySchema.safeParse(body);
  if (!bodyJson.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const result = await requestOtp(bodyJson.data.phone);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason === 'rate_limited' ? 'rate_limited' : 'invalid_phone' },
      { status: result.reason === 'rate_limited' ? 429 : 400 }
    );
  }
  return NextResponse.json({ ok: true, devCode: result.devCode ?? undefined });
}
