import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      topProductsRaw,
    ] = await Promise.all([
      prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } }, select: { total: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: 'CANCELLED' } }, select: { total: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count(),
      prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { items: { take: 1 }, payment: { select: { status: true } } } }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.total), 0)
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + Number(o.total), 0)
    const revenueGrowth = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
    const avgTicket = totalOrders > 0 ? monthRevenue / (monthOrders.length || 1) : 0

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: monthRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: 0,
        avgTicket,
        recentOrders: recentOrders.map((o) => ({ ...o, total: Number(o.total), subtotal: Number(o.subtotal) })),
        topProducts: topProductsRaw.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          total: p._sum.quantity || 0,
        })),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
