import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
}

/** GET /api/account/orders — authenticated order history (§6.5). */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: cors() });

  const orders = await prisma.order.findMany({
    where: { customerId: auth.customerId },
    orderBy: { placedAt: 'desc' },
    select: {
      id: true, status: true, subtotal: true, shippingFee: true, total: true, placedAt: true,
      items: {
        select: {
          quantity: true, unitPrice: true,
          variant: {
            select: {
              sku: true, size: true, colorName: true,
              product: { select: { slug: true, name: true } },
            },
          },
        },
      },
      payment: { select: { method: true, status: true } },
      returnReq: { select: { status: true } },
    },
  });
  return NextResponse.json({ orders }, { headers: cors() });
}
