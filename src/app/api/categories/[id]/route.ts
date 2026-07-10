import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    if (!category) return NextResponse.json({ success: false, error: 'Categoria não encontrada' }, { status: 404 })
    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const data = categorySchema.parse(body)
    const category = await prisma.category.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: category })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.category.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true, message: 'Categoria desativada' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
