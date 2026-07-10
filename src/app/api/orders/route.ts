import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { z } from 'zod'

const orderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  cpf: z.string().min(11),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    district: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).optional(),
  deliveryDate: z.string(),
  deliveryTime: z.string(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  giftMessage: z.string().optional(),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD']),
  installments: z.number().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    extras: z.any().optional(),
  })).min(1),
  subtotal: z.number(),
  shippingCost: z.number(),
  discount: z.number(),
  total: z.number(),
  couponCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    // Find or create user/customer
    let user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) {
      const bcrypt = await import('bcryptjs')
      const tempPassword = await bcrypt.hash(Math.random().toString(36), 10)
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: tempPassword,
          role: 'CUSTOMER',
        },
      })
    }

    let customer = await prisma.customer.findUnique({ where: { userId: user.id } })
    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId: user.id, phone: data.phone, cpf: data.cpf },
      })
    }

    // Create address if delivery
    let address = null
    if (data.deliveryType === 'DELIVERY' && data.address) {
      address = await prisma.address.create({
        data: { ...data.address, customerId: customer.id, label: 'Entrega' },
      })
    }

    // Find coupon
    let coupon = null
    if (data.couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode, isActive: true } })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        customerId: customer.id,
        addressId: address?.id,
        status: 'PENDING',
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        discount: data.discount,
        total: data.total,
        couponId: coupon?.id,
        couponCode: data.couponCode,
        deliveryType: data.deliveryType,
        deliveryDate: new Date(data.deliveryDate),
        deliveryTime: data.deliveryTime,
        giftMessage: data.giftMessage,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        items: {
          create: await Promise.all(data.items.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } })
            return {
              productId: item.productId,
              productName: product?.name || 'Produto',
              productImg: product?.images[0] || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              extras: item.extras || {},
            }
          })),
        },
      },
    })

    // Create payment
    let paymentData: { pixCode?: string; pixQrCode?: string } = {}
    if (data.paymentMethod === 'PIX') {
      // Generate PIX code (in production, integrate with Mercado Pago or Pagar.me)
      paymentData = {
        pixCode: `00020126580014br.gov.bcb.pix0136${user.id}520400005303986540${data.total.toFixed(2)}5802BR5913Terra Mais6009GRAVATAI62070503***6304${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_TERRA_MAIS_${order.id}`,
      }
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: data.paymentMethod,
        status: 'PENDING',
        amount: data.total,
        installments: data.installments || 1,
        ...paymentData,
      },
    })

    // Update coupon usage
    if (coupon) {
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } })
    }

    // Update stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, payment: true, address: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        order: { ...fullOrder, subtotal: Number(fullOrder?.subtotal), total: Number(fullOrder?.total) },
        payment: fullOrder?.payment ? { ...fullOrder.payment, pixCode: paymentData.pixCode, pixQrCode: paymentData.pixQrCode } : null,
      },
    }, { status: 201 })
  } catch (err) {
    console.error('Order error:', err)
    const msg = err instanceof Error ? err.message : 'Erro ao criar pedido'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip,
        include: { items: true, payment: true, address: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({ ...o, subtotal: Number(o.subtotal), total: Number(o.total) })),
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}
