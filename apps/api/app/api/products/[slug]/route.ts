import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, alt: true } },
      variants: {
        orderBy: { id: 'asc' },
        select: { id: true, sku: true, size: true, colorName: true, stock: true },
      },
      reviews: {
        where: { isPublished: true, verifiedPurchase: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, rating: true, text: true, createdAt: true, customer: { select: { name: true } } },
      },
    },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ product });
}
