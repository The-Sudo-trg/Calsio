import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  address: z.object({
    receiver: z.string().min(2).max(80),
    line1: z.string().min(5).max(120),
    line2: z.string().max(120).optional(),
    city: z.string().min(2).max(60),
    state: z.string().min(2).max(60),
    pincode: z.string().regex(/^\d{6}$/),
  }),
  reason: z.string().min(10).max(500),
});

const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });

/**
 * POST /api/orders/[id]/return — start a return (§6.5).
 * Allowed only once the order is DELIVERED and has no live return.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: cors() });

  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id },
    select: { customerId: true, status: true, returnReq: { select: { id: true } } },
  });
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: cors() });
  if (order.customerId !== auth.customerId) return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: cors() });
  if (order.status !== 'DELIVERED') {
    return NextResponse.json({ error: 'return_not_allowed', reason: 'order_not_delivered_yet' }, { status: 400, headers: cors() });
  }
  if (order.returnReq) {
    return NextResponse.json({ error: 'return_already_requested' }, { status: 409, headers: cors() });
  }

  const ret = await prisma.return.create({
    data: {
      orderId: id,
      reason: parsed.data.reason,
      status: 'REQUESTED',
    },
  });
  return NextResponse.json({ ok: true, returnId: ret.id, status: ret.status }, { headers: cors() });
}
