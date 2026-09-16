import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  productId:     z.string().optional(),
  productName:   z.string().min(1).optional(),
  productImg:    z.string().optional(),
  quantity:      z.number().int().min(1).optional(),
  unitPrice:     z.number().positive().optional(),
  total:         z.number().positive().optional(),
  customerName:  z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD']).optional(),
  notes:         z.string().optional(),
  soldAt:        z.string().optional(),
})

// ── GET ───────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const sale = await prisma.sale.findUnique({ where: { id } })
    if (!sale) {
      return NextResponse.json({ success: false, error: 'Venda não encontrada' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      data: { ...sale, unitPrice: Number(sale.unitPrice), total: Number(sale.total) },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const existing = await prisma.sale.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Venda não encontrada' }, { status: 404 })
    }
    if (existing.type === 'ONLINE') {
      return NextResponse.json(
        { success: false, error: 'Vendas do site não podem ser editadas aqui' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...data,
        soldAt: data.soldAt ? new Date(data.soldAt) : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: { ...sale, unitPrice: Number(sale.unitPrice), total: Number(sale.total) },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao editar'
    if (msg === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const existing = await prisma.sale.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Venda não encontrada' }, { status: 404 })
    }
    if (existing.type === 'ONLINE') {
      return NextResponse.json(
        { success: false, error: 'Vendas do site não podem ser excluídas aqui' },
        { status: 400 }
      )
    }

    await prisma.sale.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Venda excluída com sucesso' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir'
    if (msg === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
