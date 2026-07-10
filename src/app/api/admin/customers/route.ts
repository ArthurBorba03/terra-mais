import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const customers = await prisma.customer.findMany({
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { status: { not: 'CANCELLED' } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = customers.map((c) => ({
      id: c.id,
      name: c.user.name,
      email: c.user.email,
      phone: c.phone,
      cpf: c.cpf,
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((s, o) => s + Number(o.total), 0),
      createdAt: c.user.createdAt,
    }))

    return NextResponse.json({ success: true, data: serialized })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
