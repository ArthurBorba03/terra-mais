'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2, Save, X, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  description?: string | null
  type: string
  value: number
  minAmount?: number | null
  usageCount: number
  usageLimit?: number | null
  isActive: boolean
  expiresAt?: string | null
}

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', description: '', type: 'PERCENTAGE', value: '', minAmount: '', usageLimit: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      setCoupons(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          description: form.description,
          type: form.type,
          value: parseFloat(form.value),
          minAmount: form.minAmount ? parseFloat(form.minAmount) : null,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
          isActive: true,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Cupom criado!')
      setShowForm(false)
      setForm({ code: '', description: '', type: 'PERCENTAGE', value: '', minAmount: '', usageLimit: '' })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar cupom')
    } finally {
      setSaving(false)
    }
  }

  const typeLabel = { PERCENTAGE: '% Desconto', FIXED: 'R$ Fixo', FREE_SHIPPING: 'Frete Grátis' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Cupons de Desconto</h1>
          <p className="text-gray-500 text-sm">{coupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Cupom
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">Novo Cupom</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Código *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field font-mono uppercase" placeholder="DESCONTO10" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Tipo *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
                <option value="FREE_SHIPPING">Frete Grátis</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Valor *</label>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} type="number" step="0.01" className="input-field" placeholder={form.type === 'PERCENTAGE' ? '10' : '20.00'} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Pedido Mínimo</label>
              <input value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} type="number" step="0.01" className="input-field" placeholder="100.00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Limite de Uso</label>
              <input value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} type="number" className="input-field" placeholder="Sem limite" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Descrição interna" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Criar Cupom
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Código', 'Tipo', 'Valor', 'Mín. Pedido', 'Uso', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono font-bold text-brand-700">{coupon.code}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{typeLabel[coupon.type as keyof typeof typeLabel]}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : coupon.type === 'FIXED' ? formatCurrency(coupon.value) : 'Grátis'}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{coupon.minAmount ? formatCurrency(coupon.minAmount) : '–'}</td>
                  <td className="px-5 py-4 text-gray-500">{coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {coupon.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
