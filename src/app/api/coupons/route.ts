import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { couponSchema } from '@/lib/validations'

export async function GET() {
  try {
    await requireAdmin()
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({
      success: true,
      data: coupons.map((c) => ({ ...c, value: Number(c.value), minAmount: c.minAmount ? Number(c.minAmount) : null })),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const data = couponSchema.parse(body)
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    })
    return NextResponse.json({ success: true, data: { ...coupon, value: Number(coupon.value) } }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg === 'Unauthorized') return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
