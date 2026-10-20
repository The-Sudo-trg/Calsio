import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'calsio-api',
    phase: 1,
    message: 'Agra se. Aapke kadmon tak.',
  });
}
