import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(20).default(6) });

/** Published verified-purchase reviews for the Home review wall (§6.1). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!query.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { isPublished: true, verifiedPurchase: true },
    orderBy: { createdAt: 'desc' },
    take: query.data.limit,
    select: {
      id: true, rating: true, text: true, createdAt: true,
      product: { select: { slug: true, name: true } },
    },
  });
  return NextResponse.json({ reviews });
}
