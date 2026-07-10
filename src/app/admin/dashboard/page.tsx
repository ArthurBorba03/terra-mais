'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  avgTicket: number
  recentOrders: Array<{ id: string; orderNumber: string; status: string; total: number; createdAt: string }>
  topProducts: Array<{ productId: string; productName: string; total: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.success) setStats(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const cards = [
    { label: 'Receita do Mês', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp, growth: stats?.revenueGrowth || 0, color: 'bg-brand-50 text-brand-700', iconBg: 'bg-brand-700' },
    { label: 'Total de Pedidos', value: String(stats?.totalOrders || 0), icon: ShoppingBag, growth: 0, color: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-600' },
    { label: 'Produtos Ativos', value: String(stats?.totalProducts || 0), icon: Package, growth: 0, color: 'bg-purple-50 text-purple-700', iconBg: 'bg-purple-600' },
    { label: 'Clientes', value: String(stats?.totalCustomers || 0), icon: Users, growth: 0, color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Visão geral da loja em tempo real</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              {card.growth !== 0 && (
                <span className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg', card.growth > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                  {card.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(card.growth)}%
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{card.label}</p>
            <p className="font-display text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-800">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-brand-700 hover:text-brand-800 font-medium">Ver todos →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentOrders.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">Nenhum pedido ainda</p>
            )}
            {stats?.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className={cn('badge text-xs', ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                <span className="font-bold text-brand-700 text-sm flex-shrink-0">{formatCurrency(order.total)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-800">Mais Vendidos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4 px-6 py-4">
                <span className="w-7 h-7 bg-brand-50 text-brand-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm line-clamp-1">{p.productName}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{p.total} vendas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Novo Produto', href: '/admin/produtos/new', emoji: '➕' },
          { label: 'Ver Pedidos', href: '/admin/pedidos', emoji: '📦' },
          { label: 'Gerenciar Cupons', href: '/admin/cupons', emoji: '🎫' },
          { label: 'Ver Relatórios', href: '/admin/relatorios', emoji: '📊' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="card p-5 flex flex-col items-center gap-2 text-center hover:-translate-y-1 transition-transform">
            <span className="text-2xl">{l.emoji}</span>
            <span className="text-sm font-semibold text-gray-700">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
