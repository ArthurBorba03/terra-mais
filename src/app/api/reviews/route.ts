import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { reviewSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ success: false, error: 'Faça login para avaliar' }, { status: 401 })

    const body = await req.json()
    const data = reviewSchema.parse(body)

    const customer = await prisma.customer.findUnique({ where: { userId: user.userId } })
    if (!customer) return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 })

    const existing = await prisma.review.findFirst({
      where: { productId: data.productId, customerId: customer.id },
    })
    if (existing) return NextResponse.json({ success: false, error: 'Você já avaliou este produto' }, { status: 400 })

    const review = await prisma.review.create({
      data: { ...data, customerId: customer.id, isApproved: false },
    })

    return NextResponse.json({ success: true, data: review, message: 'Avaliação enviada! Será publicada após moderação.' }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar avaliação'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const where: Record<string, unknown> = { isApproved: true }
    if (productId) where.productId = productId

    const reviews = await prisma.review.findMany({
      where,
      include: { customer: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar avaliações' }, { status: 500 })
  }
}
