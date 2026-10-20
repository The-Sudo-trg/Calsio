import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { computeTotals } from '@/lib/pricing';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const AddressSchema = z.object({
  receiver: z.string().min(2).max(80),
  line1: z.string().min(5).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/),
});

const BodySchema = z.object({
  items: z.array(z.object({ sku: z.string().min(1), quantity: z.number().int().min(1).max(5) })).min(1),
  address: AddressSchema,
  method: z.enum(['UPI', 'COD']),
});

const MOCK_PAYMENTS = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_todo_replace') ?? true;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/checkout — §6.4.
 * Auth required (guest passes the OTP gate first). Prices always come from the DB,
 * never from the client. Stock is reserved transactionally via guarded decrement —
 * out-of-stock races surface as 409.
 * UPI: real Razorpay order when keys are configured; dev-mock auto-paid otherwise.
 * COD: order confirmed immediately (payment stays PENDING).
 */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issues: parsed.error.issues }, { status: 400 });
  }
  const { items, address, method } = parsed.data;

  const variants = await prisma.variant.findMany({
    where: { sku: { in: items.map((i) => i.sku) } },
    include: { product: { select: { isCodEnabled: true, isActive: true, name: true } } },
  });
  const bySku = new Map(variants.map((v) => [v.sku, v]));

  for (const item of items) {
    const v = bySku.get(item.sku);
    if (!v) {
      return NextResponse.json({ error: 'sku_not_found', sku: item.sku }, { status: 400, headers: corsHeaders() });
    }
    if (!v.product.isActive) {
      return NextResponse.json({ error: 'product_inactive', sku: item.sku }, { status: 400, headers: corsHeaders() });
    }
    if (method === 'COD' && !v.product.isCodEnabled) {
      return NextResponse.json(
        { error: 'cod_not_available', sku: item.sku, product: v.product.name },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (v.stock < item.quantity) {
      return NextResponse.json(
        { error: 'out_of_stock', sku: item.sku, available: v.stock },
        { status: 409, headers: corsHeaders() }
      );
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. guarded stock reservation — a concurrent checkout that drains stock fails loudly
      for (const item of items) {
        const v = bySku.get(item.sku)!;
        const res = await tx.variant.updateMany({
          where: { id: v.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          const variant = await tx.variant.findUnique({ where: { id: v.id }, select: { sku: true } });
          throw { outOfStock: variant?.sku ?? v.id };
        }
      }

      // 2. server-side pricing from DB
      const priced = new Map(
        (
          await tx.variant.findMany({
            where: { id: { in: items.map((i) => bySku.get(i.sku)!.id) } },
            select: { id: true, product: { select: { price: true, isCodEnabled: true } } },
          })
        ).map((v) => [v.id, v])
      );

      for (const item of items) {
        const v = priced.get(bySku.get(item.sku)!.id)!;
        if (method === 'COD' && !v.product.isCodEnabled) throw { codNotAvailable: item.sku };
      }

      const totals = computeTotals(
        items.map((i) => ({ price: priced.get(bySku.get(i.sku)!.id)!.product.price, quantity: i.quantity }))
      );

      // 3. create order + items
      const order = await tx.order.create({
        data: {
          customerId: auth.customerId,
          status: 'PLACED',
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          total: totals.total,
          addressSnapshot: address,
          items: {
            create: items.map((i) => ({
              variantId: bySku.get(i.sku)!.id,
              quantity: i.quantity,
              unitPrice: priced.get(bySku.get(i.sku)!.id)!.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // 4. payment record (+ Razorpay order when live keys exist)
      let razorpayOrderId: string | null = null;
      if (method === 'UPI' && !MOCK_PAYMENTS) {
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: totals.total * 100, currency: 'INR', receipt: order.id }),
        });
        if (!res.ok) {
          console.error('[razorpay] order create failed:', await res.text());
          throw { razorpay: 'order_create_failed' };
        }
        const rz = (await res.json()) as { id: string };
        razorpayOrderId = rz.id;
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          method,
          status: method === 'UPI' && MOCK_PAYMENTS ? 'PAID' : 'PENDING',
          amount: totals.total,
          razorpayOrderId,
          signatureVerified: method === 'UPI' && MOCK_PAYMENTS ? true : false,
        },
      });

      // 5. immediate confirmation for COD and dev-mock payments
      if (method === 'COD' || (method === 'UPI' && MOCK_PAYMENTS)) {
        await tx.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } });
      }

      return order;
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: result.id,
        total: result.total,
        method,
        mockPaid: MOCK_PAYMENTS && method === 'UPI',
        message: 'Agra se. Aapke kadmon tak. Order placed!',
      },
      { headers: corsHeaders() }
    );
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      if ('outOfStock' in err) {
        return NextResponse.json(
          { error: 'out_of_stock_race', sku: (err as { outOfStock?: string }).outOfStock },
          { status: 409, headers: corsHeaders() }
        );
      }
      if ('codNotAvailable' in err) {
        return NextResponse.json({ error: 'cod_not_available' }, { status: 400, headers: corsHeaders() });
      }
    }
    console.error('[checkout] failed:', err);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500, headers: corsHeaders() });
  }
}
