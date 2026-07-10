import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, payment: true, address: true },
    })

    return NextResponse.json({
      success: true,
      data: { ...order, total: Number(order.total), subtotal: Number(order.subtotal) },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
