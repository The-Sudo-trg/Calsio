import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * POST /api/webhooks/razorpay — §6.4 / §10 security bar.
 * Verifies HMAC SHA256 of the RAW body against x-razorpay-signature using
 * RAZORPAY_WEBHOOK_SECRET. Handles payment.captured / payment.failed.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  if (!secret || secret.includes('todo')) {
    // no live secret configured — reject (fail-closed, zero secrets client-side)
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; method?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  switch (event.event) {
    case 'payment.captured': {
      if (!payment?.order_id) return NextResponse.json({ ok: true, ignored: true });
      const local = await prisma.payment.findFirst({
        where: { razorpayOrderId: payment.order_id },
        select: { id: true, orderId: true },
      });
      if (local) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: local.id },
            data: {
              status: 'PAID',
              razorpayPaymentId: payment.id ?? null,
              signatureVerified: true,
            },
          }),
          prisma.order.update({
            where: { id: local.orderId },
            data: { status: 'CONFIRMED' },
          }),
        ]);
      }
      return NextResponse.json({ ok: true });
    }
    case 'payment.failed': {
      if (!payment?.order_id) return NextResponse.json({ ok: true, ignored: true });
      const local = await prisma.payment.findFirst({
        where: { razorpayOrderId: payment.order_id },
        select: { id: true, orderId: true },
      });
      if (local) {
        await prisma.payment.update({
          where: { id: local.id },
          data: { status: 'FAILED', razorpayPaymentId: payment.id ?? null },
        });
      }
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ ok: true, ignored: event.event ?? 'unknown' });
  }
}
