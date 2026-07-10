import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetail from './ProductDetail'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        include: {
          customer: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!product) return null

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    include: { category: true },
  })

  const avgRating =
    product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  return { product, related, avgRating }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProduct(slug)
  if (!data) return { title: 'Produto não encontrado' }
  const { product } = data
  return {
    title: product.name,
    description: product.shortDesc || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const data = await getProduct(slug)
  if (!data) notFound()

  const { product, related, avgRating } = data

  const serialized = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    avgRating,
    reviews: product.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    related: related.map((r) => ({
      ...r,
      price: Number(r.price),
      comparePrice: r.comparePrice ? Number(r.comparePrice) : null,
    })),
  }

  return <ProductDetail product={serialized as never} />
}
