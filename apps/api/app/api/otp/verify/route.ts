import { verifyOtp } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({ phone: z.string(), code: z.coerce.number().int().min(100000).max(999999) });

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

/** POST { phone, code } → session token (existing or new customer). */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const bodyJson = BodySchema.safeParse(body);
  if (!bodyJson.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const result = await verifyOtp(bodyJson.data.phone, bodyJson.data.code);
  if (!result.ok) {
    const status = result.reason === 'too_many_attempts' ? 429 : result.reason === 'invalid_code' ? 401 : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({
    ok: true,
    token: result.token,
    customerId: result.customerId,
    isNewCustomer: result.isNewCustomer,
  });
}
