import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    const coupon = await prisma.coupon.findUnique({
      where: { code: code?.toUpperCase(), isActive: true },
    })

    if (!coupon) return NextResponse.json({ success: false, error: 'Cupom inválido ou expirado' }, { status: 400 })
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Cupom expirado' }, { status: 400 })
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'Cupom esgotado' }, { status: 400 })
    }
    if (coupon.minAmount && subtotal < Number(coupon.minAmount)) {
      return NextResponse.json({ success: false, error: `Pedido mínimo de R$ ${Number(coupon.minAmount).toFixed(2)} para este cupom` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        minAmount: coupon.minAmount ? Number(coupon.minAmount) : null,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao validar cupom' }, { status: 500 })
  }
}
