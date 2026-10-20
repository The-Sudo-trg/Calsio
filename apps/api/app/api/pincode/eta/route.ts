import { etaForPincode } from '@/lib/eta';
import { NextResponse } from 'next/server';

/** GET /api/pincode/eta?pincode=282001 — §6.3 delivery-ETA checker. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pincode = url.searchParams.get('pincode') ?? '';
  const eta = etaForPincode(pincode);
  if (!eta) {
    return NextResponse.json({ error: 'invalid_pincode' }, { status: 400 });
  }
  return NextResponse.json(eta);
}
