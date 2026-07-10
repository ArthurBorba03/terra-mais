'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'OUT_FOR_DELIVERY', label: 'Em Entrega' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

export default function PedidosPage() {
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; status: string; total: number; createdAt: string; deliveryType: string }>>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status])

  const filtered = orders.filter((o) =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-500 text-sm">{orders.length} pedidos encontrados</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0', status === tab.value ? 'bg-brand-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por número do pedido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Pedido', 'Data', 'Tipo', 'Status', 'Total', 'Ações'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-brand-700 text-xs">{order.orderNumber}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={cn('badge text-xs', order.deliveryType === 'PICKUP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                        {order.deliveryType === 'PICKUP' ? 'Retirada' : 'Entrega'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('badge text-xs', ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-800">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-brand-700 hover:text-brand-800 font-medium text-xs">Ver detalhes →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
