'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  deliveryType: string
  deliveryDate?: string
  deliveryTime?: string
  giftMessage?: string
  recipientName?: string
  createdAt: string
  couponCode?: string
  items: Array<{
    id: string
    productName: string
    quantity: number
    unitPrice: number
    productImg?: string
  }>
  payment?: { method: string; status: string; amount: number } | null
  address?: {
    street: string; number: string; district: string; city: string; state: string; zipCode: string
  } | null
  customer?: { user: { name: string; email: string } } | null
}

const ALL_STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.data) })
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder((prev) => prev ? { ...prev, status } : prev)
        toast.success('Status atualizado!')
      } else {
        toast.error(data.error || 'Erro ao atualizar')
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Pedido não encontrado</p>
        <button onClick={() => router.back()} className="btn-secondary text-sm mt-4">Voltar</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-gray-800">
            Pedido <span className="font-mono text-brand-700">{order.orderNumber}</span>
          </h1>
          <p className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={cn('badge text-sm px-3 py-1.5', ORDER_STATUS_COLORS[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Itens do Pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">
                    {item.productImg ? (
                      <img src={item.productImg} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : '🌸'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-400">Qtd: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <span className="font-bold text-gray-800">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto {order.couponCode && `(${order.couponCode})`}</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Frete</span><span>{order.shippingCost === 0 ? 'Grátis' : formatCurrency(order.shippingCost)}</span></div>
              <div className="flex justify-between font-bold text-base text-brand-700 pt-2 border-t border-gray-100"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Informações de Entrega</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">Tipo</p><p className="font-medium">{order.deliveryType === 'PICKUP' ? 'Retirada na loja' : 'Entrega em domicílio'}</p></div>
              {order.deliveryDate && <div><p className="text-xs text-gray-400 mb-0.5">Data / Horário</p><p className="font-medium">{formatDateTime(order.deliveryDate)} · {order.deliveryTime}</p></div>}
              {order.recipientName && <div><p className="text-xs text-gray-400 mb-0.5">Destinatário</p><p className="font-medium">{order.recipientName}</p></div>}
              {order.giftMessage && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Mensagem</p><p className="text-gray-700 italic">"{order.giftMessage}"</p></div>}
            </div>
            {order.address && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                {order.address.street}, {order.address.number} – {order.address.district}, {order.address.city}/{order.address.state} – CEP {order.address.zipCode}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          {order.customer && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Cliente</h3>
              <p className="font-medium text-gray-700">{order.customer.user.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order.customer.user.email}</p>
            </div>
          )}

          {/* Payment */}
          {order.payment && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Pagamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Método</span><span className="font-medium">{order.payment.method === 'PIX' ? 'PIX' : order.payment.method === 'CREDIT_CARD' ? 'Crédito' : 'Débito'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={cn('badge text-xs', order.payment.status === 'APPROVED' ? 'bg-green-100 text-green-700' : order.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>{order.payment.status === 'APPROVED' ? 'Pago' : order.payment.status === 'PENDING' ? 'Pendente' : 'Cancelado'}</span></div>
              </div>
            </div>
          )}

          {/* Status update */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Atualizar Status</h3>
            <div className="space-y-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={s === order.status || updating}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                    s === order.status
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  )}
                >
                  {updating && <Loader2 className="w-3 h-3 animate-spin inline mr-2" />}
                  {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
