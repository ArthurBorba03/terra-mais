import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || searchParams.get('categoria')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true' || searchParams.get('destaque') === 'true'
    const bestseller = searchParams.get('bestseller') === 'true' || searchParams.get('maisVendidos') === 'true'
    const isNew = searchParams.get('new') === 'true' || searchParams.get('novidades') === 'true'
    const promotion = searchParams.get('promotion') === 'true' || searchParams.get('promocao') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = { slug: category }
    if (search) where.name = { contains: search, mode: 'insensitive' }
    if (featured) where.isFeatured = true
    if (bestseller) where.isBestseller = true
    if (isNew) where.isNew = true
    if (promotion) where.isPromotion = true
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'price_asc') orderBy.price = 'asc'
    else if (sort === 'price_desc') orderBy.price = 'desc'
    else if (sort === 'bestseller') orderBy.isBestseller = 'desc'
    else orderBy.createdAt = 'desc'

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        include: { category: true, _count: { select: { reviews: true } } },
        orderBy,
      }),
      prisma.product.count({ where }),
    ])

    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }))

    return NextResponse.json({
      success: true,
      data: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const data = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: data.slug || slugify(data.name),
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        costPrice: undefined,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: { ...product, price: Number(product.price) } }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar produto'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
