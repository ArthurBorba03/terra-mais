import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { where: { isApproved: true }, include: { customer: { include: { user: { select: { name: true } } } } }, take: 20 } },
    })
    if (!product) return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: { ...product, price: Number(product.price), comparePrice: product.comparePrice ? Number(product.comparePrice) : null } })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const data = productSchema.parse(body)
    const product = await prisma.product.update({ where: { id }, data: { ...data, price: data.price, comparePrice: data.comparePrice ?? null }, include: { category: true } })
    return NextResponse.json({ success: true, data: { ...product, price: Number(product.price) } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.product.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true, message: 'Produto desativado com sucesso' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao deletar'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
