import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const QuerySchema = z.object({
  category: z.enum(['SNEAKERS', 'LOAFERS', 'SANDALS', 'FORMAL']).optional().or(z.literal('all')),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).optional().or(z.literal('all')),
  size: z.string().optional(),
  color: z.string().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest']).default('newest'),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!query.success) {
    return NextResponse.json({ error: 'invalid_query', issues: query.error.issues }, { status: 400 });
  }
  const { category, gender, size, color, minPrice, maxPrice, sort, page, pageSize } = query.data;

  const where: Record<string, unknown> = { isActive: true };
  if (category && category !== 'all') where.category = category;
  if (gender && gender !== 'all') where.gender = gender;
  if (minPrice || maxPrice) {
    where.price = { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) };
  }
  if (color) where.colorway = { contains: color, mode: 'insensitive' as const };
  if (size) where.variants = { some: { size, stock: { gt: 0 } } };

  const orderBy =
    sort === 'price-asc' ? { price: 'asc' as const } :
    sort === 'price-desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: page * pageSize,
      take: pageSize + 1, // one extra to compute hasMore
      select: {
        id: true, slug: true, name: true, category: true, gender: true,
        price: true, mrp: true, isCodEnabled: true, colorway: true, occasion: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
        reviews: { where: { isPublished: true }, select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const hasMore = products.length > pageSize;
  const items = products.slice(0, pageSize).map((p) => ({
    ...p,
    image: p.images[0] ?? null,
    images: undefined,
    ratingAvg: p.reviews.length
      ? Math.round((p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length) * 10) / 10
      : null,
    reviewCount: p.reviews.length,
    reviews: undefined,
  }));

  return NextResponse.json({ items, total, page, pageSize, hasMore });
}
