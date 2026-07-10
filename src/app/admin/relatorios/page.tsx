'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, Users, BarChart2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  avgTicket: number
  topProducts: Array<{ productName: string; total: number }>
}

export default function RelatoriosPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const cards = [
    { label: 'Receita do Mês', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp, color: 'bg-green-50 text-green-700', iconBg: 'bg-green-600', growth: stats?.revenueGrowth },
    { label: 'Total de Pedidos', value: String(stats?.totalOrders || 0), icon: ShoppingBag, color: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-600' },
    { label: 'Ticket Médio', value: formatCurrency(stats?.avgTicket || 0), icon: BarChart2, color: 'bg-purple-50 text-purple-700', iconBg: 'bg-purple-600' },
    { label: 'Total de Clientes', value: String(stats?.totalCustomers || 0), icon: Users, color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-500' },
    { label: 'Produtos Ativos', value: String(stats?.totalProducts || 0), icon: Package, color: 'bg-rose-50 text-rose-700', iconBg: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-800">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">Visão consolidada do desempenho da loja</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{card.label}</p>
            <p className="font-display text-xl font-bold text-gray-800">{card.value}</p>
            {card.growth !== undefined && card.growth !== 0 && (
              <p className={`text-xs mt-1 font-semibold ${card.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {card.growth > 0 ? '↑' : '↓'} {Math.abs(card.growth)}% vs mês anterior
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-5">Produtos Mais Vendidos</h2>
          <div className="space-y-3">
            {stats?.topProducts.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Nenhum dado disponível ainda</p>
            )}
            {stats?.topProducts.map((p, i) => (
              <div key={p.productName} className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700'
                  : i === 1 ? 'bg-gray-100 text-gray-600'
                  : i === 2 ? 'bg-orange-100 text-orange-700'
                  : 'bg-brand-50 text-brand-700'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{p.productName}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (p.total / (stats.topProducts[0]?.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-600 flex-shrink-0">{p.total} un.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-5">Resumo Financeiro</h2>
          <div className="space-y-4">
            {[
              { label: 'Receita Total do Mês', value: formatCurrency(stats?.totalRevenue || 0), color: 'text-green-700 bg-green-50' },
              { label: 'Ticket Médio por Pedido', value: formatCurrency(stats?.avgTicket || 0), color: 'text-blue-700 bg-blue-50' },
              { label: 'Crescimento vs Mês Anterior', value: `${stats?.revenueGrowth || 0}%`, color: (stats?.revenueGrowth || 0) >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl ${item.color}`}>
                <span className="text-sm font-medium">{item.label}</span>
                <span className="font-bold text-lg">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              📊 Relatórios detalhados com exportação CSV disponíveis em breve na versão Pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
