'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  TrendingUp, ShoppingBag, Package, Users,
  RefreshCw, Loader2, Plus, Ticket, BarChart2,
  Store, Truck,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DashboardData {
  kpis: {
    receitaMes:    number
    totalPedidos:  number
    produtosAtivos:number
    totalClientes: number
  }
  pedidosRecentes: {
    id:           string
    orderNumber:  string
    status:       string
    total:        number
    createdAt:    string
    deliveryType: string
  }[]
  topProdutos: {
    id:           string
    name:         string
    totalVendas:  number
  }[]
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:           { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:         { label: 'Confirmado',  color: 'bg-blue-100 text-blue-700' },
  PREPARING:         { label: 'Preparando',  color: 'bg-purple-100 text-purple-700' },
  OUT_FOR_DELIVERY:  { label: 'Em entrega',  color: 'bg-orange-100 text-orange-700' },
  DELIVERED:         { label: 'Entregue',    color: 'bg-green-100 text-green-700' },
  CANCELLED:         { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      const d   = await res.json()
      if (d.success) setData(d.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const { kpis, pedidosRecentes, topProdutos } = data!

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Visão geral da loja em tempo real</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon:  TrendingUp,
            label: 'RECEITA DO MÊS',
            value: formatCurrency(kpis.receitaMes),
            color: 'bg-brand-600',
            sub:   'Pedidos confirmados + entregues',
          },
          {
            icon:  ShoppingBag,
            label: 'TOTAL DE PEDIDOS',
            value: String(kpis.totalPedidos),
            color: 'bg-blue-600',
            sub:   'Este mês',
          },
          {
            icon:  Package,
            label: 'PRODUTOS ATIVOS',
            value: String(kpis.produtosAtivos),
            color: 'bg-purple-600',
            sub:   'No catálogo',
          },
          {
            icon:  Users,
            label: 'CLIENTES',
            value: String(kpis.totalClientes),
            color: 'bg-orange-500',
            sub:   'Cadastrados',
          },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-4`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{c.label}</p>
            <p className="font-display text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Grid central */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pedidos Recentes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-gray-800 text-lg">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-brand-600 font-medium hover:underline">
              Ver todos →
            </Link>
          </div>

          {pedidosRecentes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum pedido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosRecentes.map((p) => {
                const st = STATUS_LABEL[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Ícone entrega vs retirada */}
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {p.deliveryType === 'DELIVERY'
                        ? <Truck className="w-4 h-4 text-gray-500" />
                        : <Store className="w-4 h-4 text-gray-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-bold text-gray-700 truncate">{p.orderNumber}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-500">
                          {p.deliveryType === 'DELIVERY' ? '🚚 Entrega' : '🏪 Retirada'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('text-xs px-2 py-1 rounded-lg font-medium', st.color)}>
                        {st.label}
                      </span>
                      <span className="font-bold text-gray-700 text-sm">
                        {formatCurrency(p.total)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Mais Vendidos */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-gray-800 text-lg">Mais Vendidos</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Pedidos confirmados + vendas do balcão
              </p>
            </div>
            <Link href="/admin/vendas" className="text-sm text-brand-600 font-medium hover:underline">
              Ver vendas →
            </Link>
          </div>

          {topProdutos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma venda registrada</p>
              <p className="text-xs mt-1">Vendas canceladas não são contabilizadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProdutos.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {/* Ranking */}
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0',
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  )}>
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.totalVendas} unidade{p.totalVendas !== 1 ? 's' : ''} vendida{p.totalVendas !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Barra de progresso visual */}
                  <div className="w-20 flex-shrink-0">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{
                          width: `${Math.round((p.totalVendas / (topProdutos[0]?.totalVendas || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1 font-medium">
                      {Math.round((p.totalVendas / (topProdutos[0]?.totalVendas || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legenda */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              Inclui pedidos confirmados
            </span>
            <span className="flex items-center gap-1.5">
              <Store className="w-3 h-3" />
              + vendas do balcão
            </span>
          </div>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/produtos/new', icon: Plus,      label: 'Novo Produto',      color: 'text-brand-600 bg-brand-50' },
          { href: '/admin/pedidos',      icon: ShoppingBag,label: 'Ver Pedidos',       color: 'text-blue-600 bg-blue-50' },
          { href: '/admin/cupons',       icon: Ticket,    label: 'Gerenciar Cupons',  color: 'text-yellow-600 bg-yellow-50' },
          { href: '/admin/relatorios',   icon: BarChart2,  label: 'Ver Relatórios',   color: 'text-purple-600 bg-purple-50' },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow group"
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', a.color)}>
              <a.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
