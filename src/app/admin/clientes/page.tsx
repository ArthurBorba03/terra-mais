'use client'

import { useEffect, useState } from 'react'
import { Search, Loader2, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((d) => setCustomers(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm">{customers.length} clientes cadastrados</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total de Clientes', value: customers.length, color: 'bg-brand-50 text-brand-700' },
          { label: 'Receita Total', value: formatCurrency(customers.reduce((s, c) => s + c.totalSpent, 0)), color: 'bg-green-50 text-green-700' },
          { label: 'Ticket Médio', value: formatCurrency(customers.length ? customers.reduce((s, c) => s + c.totalSpent, 0) / customers.filter((c) => c.totalOrders > 0).length || 0 : 0), color: 'bg-blue-50 text-blue-700' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-5 ${stat.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{stat.label}</p>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Nome', 'E-mail', 'Telefone', 'Pedidos', 'Total Gasto', 'Desde'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800">{customer.name}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{customer.email}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{customer.phone || '–'}</td>
                    <td className="px-5 py-4">
                      <span className="badge bg-brand-100 text-brand-700">{customer.totalOrders}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-700">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(customer.createdAt)}</td>
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
