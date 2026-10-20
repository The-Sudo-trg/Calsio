import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });

/** GET /api/orders/[id] — one order, owner-only, for the tracking screen (§6.5). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: cors() });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true, customerId: true, status: true, subtotal: true, shippingFee: true,
      total: true, placedAt: true, addressSnapshot: true,
      items: {
        select: {
          quantity: true, unitPrice: true,
          variant: {
            select: { sku: true, size: true, colorName: true, product: { select: { slug: true, name: true } } },
          },
        },
      },
      payment: { select: { method: true, status: true, amount: true } },
      returnReq: { select: { status: true } },
    },
  });
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: cors() });
  if (order.customerId !== auth.customerId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: cors() });
  }
  return NextResponse.json({ order }, { headers: cors() });
}
