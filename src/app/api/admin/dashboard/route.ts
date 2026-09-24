import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  try {
    await requireAdmin()

    const now   = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)

    // Status que contam como venda concluída (tipados pelo Prisma)
    const VALID_STATUS: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ]

    const [
      receitaMes,
      totalPedidos,
      produtosAtivos,
      totalClientes,
      pedidosRecentes,
      orderItems,
      balcaoSales,
    ] = await Promise.all([

      // Receita do mês — só pedidos válidos
      prisma.order.aggregate({
        where: {
          status:    { in: VALID_STATUS },
          createdAt: { gte: start },
        },
        _sum: { total: true },
      }),

      // Total de pedidos do mês
      prisma.order.count({
        where: { createdAt: { gte: start } },
      }),

      // Produtos ativos
      prisma.product.count({ where: { isActive: true } }),

      // Total de clientes
      prisma.customer.count(),

      // Pedidos recentes (últimos 5)
      prisma.order.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select: {
          id:           true,
          orderNumber:  true,
          status:       true,
          total:        true,
          createdAt:    true,
          deliveryType: true,
        },
      }),

      // Itens de pedidos com status válido
      prisma.orderItem.findMany({
        where: {
          order: { status: { in: VALID_STATUS } },
        },
        select: {
          productId:   true,
          productName: true,
          quantity:    true,
        },
      }),

      // Vendas do balcão
      prisma.sale.findMany({
        where: { type: 'PRESENTIAL' },
        select: {
          productId:   true,
          productName: true,
          quantity:    true,
        },
      }),
    ])

    // Combinar e agrupar produtos mais vendidos
    const mapa = new Map<string, { name: string; qty: number }>()

    for (const item of orderItems) {
      const key  = item.productId || item.productName
      const prev = mapa.get(key)
      if (prev) prev.qty += item.quantity
      else mapa.set(key, { name: item.productName, qty: item.quantity })
    }

    for (const sale of balcaoSales) {
      const key  = sale.productId || sale.productName
      const prev = mapa.get(key)
      if (prev) prev.qty += sale.quantity
      else mapa.set(key, { name: sale.productName, qty: sale.quantity })
    }

    const topProdutos = Array.from(mapa.entries())
      .map(([id, { name, qty }]) => ({ id, name, totalVendas: qty }))
      .sort((a, b) => b.totalVendas - a.totalVendas)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          receitaMes:    Number(receitaMes._sum.total ?? 0),
          totalPedidos,
          produtosAtivos,
          totalClientes,
        },
        pedidosRecentes: pedidosRecentes.map((p) => ({
          ...p,
          total:     Number(p.total),
          createdAt: p.createdAt.toISOString(),
        })),
        topProdutos,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}