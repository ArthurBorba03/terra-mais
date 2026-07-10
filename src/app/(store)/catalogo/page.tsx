import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import CatalogClient from './CatalogClient'
import type { Category, Product } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Explore todo o catálogo da Terra Mais: flores, buquês, plantas, vasos, adubos e muito mais. Filtros por preço, categoria e promoções.',
}

function toProduct(p: Record<string, unknown>): Product {
  return {
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  } as unknown as Product
}

async function getData(sp: Record<string, string>) {
  const {
    categoria, search, promocao, maisVendidos, novidades, destaque,
    minPrice, maxPrice, sort, page,
  } = sp

  const pageNum = parseInt(page || '1')
  const limit = 24
  const skip = (pageNum - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (categoria) where.category = { slug: categoria }
  if (search) where.name = { contains: search, mode: 'insensitive' }
  if (promocao === 'true') where.isPromotion = true
  if (maisVendidos === 'true') where.isBestseller = true
  if (novidades === 'true') where.isNew = true
  if (destaque === 'true') where.isFeatured = true
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    }
  }

  const orderBy: Record<string, string> =
    sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
    : sort === 'bestseller' ? { isBestseller: 'desc' }
    : { createdAt: 'desc' }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where, take: limit, skip,
      include: { category: true },
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return {
    products: products.map(toProduct),
    total,
    totalPages: Math.ceil(total / limit),
    categories: categories as unknown as Category[],
    currentPage: pageNum,
  }
}

interface Props { searchParams: Promise<Record<string, string>> }

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const data = await getData(params)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🌸</div>
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        </div>
      }
    >
      <CatalogClient {...data} searchParams={params} />
    </Suspense>
  )
}
