import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

// ── Schema de validação ───────────────────────────────────────
const createSaleSchema = z.object({
  productId:    z.string().optional(),
  productName:  z.string().min(1, 'Produto obrigatório'),
  productImg:   z.string().optional(),
  quantity:     z.number().int().min(1),
  unitPrice:    z.number().positive(),
  total:        z.number().positive(),
  customerName: z.string().optional(),
  customerPhone:z.string().optional(),
  paymentMethod:z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD']).default('CASH'),
  notes:        z.string().optional(),
  soldAt:       z.string().optional(),
})

// ── GET — listar vendas com filtros ───────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const filter  = searchParams.get('filter') || 'month' // day | week | month | custom
    const from    = searchParams.get('from')
    const to      = searchParams.get('to')
    const type    = searchParams.get('type') // ONLINE | PRESENTIAL | all
    const page    = parseInt(searchParams.get('page') || '1')
    const limit   = parseInt(searchParams.get('limit') || '50')
    const skip    = (page - 1) * limit

    // Calcular range de datas
    const now   = new Date()
    let dateFrom: Date
    let dateTo  = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    if (filter === 'custom' && from && to) {
      dateFrom = new Date(from)
      dateTo   = new Date(to + 'T23:59:59')
    } else if (filter === 'day') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    } else if (filter === 'week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      dateFrom = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0)
    } else {
      // month (default)
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    }

    const where: Record<string, unknown> = {
      soldAt: { gte: dateFrom, lte: dateTo },
    }
    if (type && type !== 'all') where.type = type

    const [sales, total, totals] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { soldAt: 'desc' },
      }),
      prisma.sale.count({ where }),
      prisma.sale.aggregate({
        where,
        _sum:   { total: true, quantity: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: sales.map((s) => ({
        ...s,
        unitPrice: Number(s.unitPrice),
        total:     Number(s.total),
        soldAt:    s.soldAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        totalRevenue: Number(totals._sum.total ?? 0),
        totalItems:   Number(totals._sum.quantity ?? 0),
        totalSales:   totals._count.id,
        dateFrom:     dateFrom.toISOString(),
        dateTo:       dateTo.toISOString(),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// ── POST — criar venda presencial ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const data = createSaleSchema.parse(body)

    const sale = await prisma.sale.create({
      data: {
        type:          'PRESENTIAL',
        productId:     data.productId || null,
        productName:   data.productName,
        productImg:    data.productImg || null,
        quantity:      data.quantity,
        unitPrice:     data.unitPrice,
        total:         data.total,
        customerName:  data.customerName || null,
        customerPhone: data.customerPhone || null,
        paymentMethod: data.paymentMethod,
        notes:         data.notes || null,
        soldAt:        data.soldAt ? new Date(data.soldAt) : new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: { ...sale, unitPrice: Number(sale.unitPrice), total: Number(sale.total) },
    }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar venda'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
