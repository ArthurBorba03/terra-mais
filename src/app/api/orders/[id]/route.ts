import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true, address: true, customer: { include: { user: { select: { name: true, email: true } } } } },
    })
    if (!order) return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: { ...order, subtotal: Number(order.subtotal), total: Number(order.total) } })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { status } = await req.json()
    const order = await prisma.order.update({ where: { id }, data: { status } })
    return NextResponse.json({ success: true, data: { ...order, total: Number(order.total) } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar pedido'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
