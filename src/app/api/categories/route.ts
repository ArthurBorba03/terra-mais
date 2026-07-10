import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { categorySchema } from '@/lib/validations'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const data = categorySchema.parse(body)
    const category = await prisma.category.create({ data })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar categoria'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
