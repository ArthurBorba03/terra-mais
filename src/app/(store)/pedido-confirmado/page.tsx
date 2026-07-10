'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  deliveryType: string
  deliveryDate?: string
  deliveryTime?: string
  items: Array<{ productName: string; quantity: number; unitPrice: number }>
}

function ConfirmacaoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.data) })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-14 h-14 text-green-500" />
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        Pedido Confirmado! 🌿
      </h1>
      <p className="text-gray-500 text-lg mb-2">
        Obrigado pela sua compra na Terra Mais!
      </p>
      {order && (
        <p className="text-brand-700 font-semibold mb-8">
          Pedido <span className="font-mono">{order.orderNumber}</span>
        </p>
      )}

      {/* Order summary card */}
      {order && (
        <div className="card p-6 mb-8 text-left">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-5">Resumo do Pedido</h2>

          <div className="space-y-3 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                <span className="font-semibold text-gray-800">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between font-bold text-base text-brand-700">
              <span>Total pago</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Package,
                label: 'Status',
                value: ORDER_STATUS_LABELS[order.status] || order.status,
                color: 'text-brand-600',
              },
              {
                icon: Truck,
                label: 'Entrega',
                value: order.deliveryType === 'PICKUP' ? 'Retirada na loja' : 'Em domicílio',
                color: 'text-blue-600',
              },
              {
                icon: Clock,
                label: 'Agendado para',
                value: order.deliveryDate
                  ? `${formatDate(order.deliveryDate)} · ${order.deliveryTime || ''}`
                  : '–',
                color: 'text-amber-600',
              },
            ].map((info) => (
              <div key={info.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <info.icon className={`w-5 h-5 mx-auto mb-1.5 ${info.color}`} />
                <p className="text-xs text-gray-500 mb-0.5">{info.label}</p>
                <p className="text-sm font-semibold text-gray-800">{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-brand-50 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-brand-800 mb-3">O que acontece agora?</h3>
        <ul className="space-y-2 text-sm text-brand-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">1.</span>
            Você receberá um e-mail de confirmação com todos os detalhes do pedido.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">2.</span>
            Nossa equipe irá preparar seu pedido com muito carinho.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">3.</span>
            Você receberá atualizações por WhatsApp sobre o status da entrega.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn-primary">
          Continuar Comprando <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '5551999999999'}?text=${encodeURIComponent('Olá! Fiz um pedido na Terra Mais e gostaria de acompanhar o status.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Falar no WhatsApp 💬
        </a>
      </div>
    </div>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>}>
      <ConfirmacaoContent />
    </Suspense>
  )
}
