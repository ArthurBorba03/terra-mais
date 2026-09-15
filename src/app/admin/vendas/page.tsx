'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, RefreshCw, Loader2, TrendingUp, ShoppingBag, Package, X, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ── Tipos ─────────────────────────────────────────────────────
interface Sale {
  id: string
  type: 'ONLINE' | 'PRESENTIAL'
  productName: string
  productImg?: string | null
  quantity: number
  unitPrice: number
  total: number
  customerName?: string | null
  customerPhone?: string | null
  paymentMethod: string
  notes?: string | null
  soldAt: string
}

interface Meta {
  total: number
  totalPages: number
  totalRevenue: number
  totalItems: number
  totalSales: number
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

// ── Constantes ────────────────────────────────────────────────
const FILTER_TABS = [
  { value: 'day',   label: 'Hoje' },
  { value: 'week',  label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' },
  { value: 'custom',label: 'Período' },
]

const TYPE_TABS = [
  { value: 'all',        label: 'Todas' },
  { value: 'ONLINE',     label: 'Online' },
  { value: 'PRESENTIAL', label: 'Presencial' },
]

const PAYMENT_LABELS: Record<string, string> = {
  CASH:        '💵 Dinheiro',
  PIX:         '💚 PIX',
  CREDIT_CARD: '💳 Crédito',
  DEBIT_CARD:  '💳 Débito',
}

// ── Componente principal ──────────────────────────────────────
export default function VendasPage() {
  const [sales, setSales]       = useState<Sale[]>([])
  const [meta, setMeta]         = useState<Meta | null>(null)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('month')
  const [typeFilter, setType]   = useState('all')
  const [from, setFrom]         = useState('')
  const [to, setTo]             = useState('')
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ filter, type: typeFilter, limit: '100' })
      if (filter === 'custom' && from && to) { params.set('from', from); params.set('to', to) }
      const res  = await fetch(`/api/sales?${params}`)
      const data = await res.json()
      if (data.success) { setSales(data.data); setMeta(data.meta) }
    } finally {
      setLoading(false)
    }
  }, [filter, typeFilter, from, to])

  useEffect(() => { load() }, [load])

  const filtered = sales.filter((s) =>
    !search ||
    s.productName.toLowerCase().includes(search.toLowerCase()) ||
    (s.customerName || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Vendas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Histórico central de faturamento</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setModal(true)} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Criar Venda
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {meta && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: 'Faturamento',  value: formatCurrency(meta.totalRevenue), color: 'bg-green-600' },
            { icon: ShoppingBag, label: 'Vendas',      value: String(meta.totalSales),           color: 'bg-blue-600' },
            { icon: Package,    label: 'Itens Vendidos', value: String(meta.totalItems),          color: 'bg-purple-600' },
          ].map((c) => (
            <div key={c.label} className="card p-5">
              <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{c.label}</p>
              <p className="font-display text-2xl font-bold text-gray-800">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros de período */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Período */}
          <div className="flex gap-2 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  filter === tab.value
                    ? 'bg-brand-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Período personalizado */}
          {filter === 'custom' && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="input-field text-sm py-2 w-auto"
              />
              <span className="text-gray-400 text-sm">até</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input-field text-sm py-2 w-auto"
              />
              <button onClick={load} className="btn-primary text-sm py-2 px-4">Filtrar</button>
            </div>
          )}

          {/* Separador */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Tipo */}
          <div className="flex gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                  typeFilter === tab.value
                    ? tab.value === 'ONLINE'     ? 'bg-blue-100 text-blue-700'
                    : tab.value === 'PRESENTIAL' ? 'bg-amber-100 text-amber-700'
                    : 'bg-brand-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por produto ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💐</div>
            <p className="text-gray-500 font-medium">Nenhuma venda encontrada</p>
            <p className="text-gray-400 text-sm mt-1">Tente outro período ou crie uma venda presencial</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Produto', 'Data', 'Cliente', 'Qtd', 'Valor Unit.', 'Total', 'Pagamento', 'Origem'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    {/* Produto */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">
                          {sale.productImg
                            ? <img src={sale.productImg} alt="" className="w-full h-full object-cover" />
                            : '🌸'
                          }
                        </div>
                        <span className="font-medium text-gray-800 max-w-[180px] truncate">{sale.productName}</span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(sale.soldAt)}
                    </td>

                    {/* Cliente */}
                    <td className="px-5 py-4">
                      {sale.customerName
                        ? <div>
                            <p className="font-medium text-gray-700 text-sm">{sale.customerName}</p>
                            {sale.customerPhone && <p className="text-xs text-gray-400">{sale.customerPhone}</p>}
                          </div>
                        : <span className="text-gray-400 text-xs italic">–</span>
                      }
                    </td>

                    {/* Qtd */}
                    <td className="px-5 py-4 text-center">
                      <span className="badge bg-gray-100 text-gray-700">{sale.quantity}</span>
                    </td>

                    {/* Valor unit */}
                    <td className="px-5 py-4 text-gray-600 text-sm">{formatCurrency(sale.unitPrice)}</td>

                    {/* Total */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-brand-700">{formatCurrency(sale.total)}</span>
                    </td>

                    {/* Pagamento */}
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                      {PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}
                    </td>

                    {/* Origem */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        'badge text-xs',
                        sale.type === 'ONLINE'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      )}>
                        {sale.type === 'ONLINE' ? '🌐 Site' : '🏪 Balcão'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Rodapé da tabela */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 text-sm text-gray-500">
              <span>{filtered.length} venda{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}</span>
              {meta && (
                <span className="font-semibold text-brand-700">
                  Total: {formatCurrency(filtered.reduce((s, v) => s + v.total, 0))}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal criar venda */}
      {showModal && (
        <CreateSaleModal
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); load() }}
        />
      )}
    </div>
  )
}

// ── Modal de criar venda presencial ──────────────────────────
function CreateSaleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [products, setProducts]     = useState<Product[]>([])
  const [saving, setSaving]         = useState(false)
  const [erro, setErro]             = useState('')
  const [searchProd, setSearchProd] = useState('')
  const [selectedProd, setSelected] = useState<Product | null>(null)

  // Form
  const [productName,  setProductName]  = useState('')
  const [quantity,     setQuantity]     = useState(1)
  const [unitPrice,    setUnitPrice]    = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone,setCustomerPhone]= useState('')
  const [paymentMethod,setPayment]      = useState('CASH')
  const [soldAt,       setSoldAt]       = useState(new Date().toISOString().split('T')[0])
  const [notes,        setNotes]        = useState('')

  const total = quantity * (parseFloat(unitPrice) || 0)

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []))
  }, [])

  function selectProduct(p: Product) {
    setSelected(p)
    setProductName(p.name)
    setUnitPrice(String(p.price))
    setSearchProd('')
  }

  async function handleSave() {
    setErro('')
    if (!productName.trim()) { setErro('Informe o produto'); return }
    if (!unitPrice || parseFloat(unitPrice) <= 0) { setErro('Informe o preço'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId:    selectedProd?.id,
          productName:  productName.trim(),
          productImg:   selectedProd?.images?.[0] || null,
          quantity,
          unitPrice:    parseFloat(unitPrice),
          total,
          customerName: customerName || undefined,
          customerPhone:customerPhone || undefined,
          paymentMethod,
          notes:        notes || undefined,
          soldAt:       soldAt ? new Date(soldAt).toISOString() : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro ao salvar')
      onCreated()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const filteredProds = products.filter((p) =>
    p.name.toLowerCase().includes(searchProd.toLowerCase())
  ).slice(0, 8)

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111', outline: 'none',
    boxSizing: 'border-box', background: '#fff', ...extra,
  })
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-800">Criar Venda Presencial</h2>
            <p className="text-gray-500 text-sm mt-0.5">Registrar venda realizada no balcão</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {erro}
            </div>
          )}

          {/* Buscar produto */}
          <div>
            <label style={lbl}>Produto *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Buscar produto do catálogo..."
                value={searchProd || productName}
                onChange={(e) => { setSearchProd(e.target.value); setProductName(e.target.value); setSelected(null) }}
                style={{ ...inp(), paddingLeft: 34 }}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              {/* Dropdown de produtos */}
              {searchProd && filteredProds.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredProds.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => selectProduct(p)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-sm">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          : '🌸'
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-brand-600">{formatCurrency(p.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {selectedProd ? `✅ Produto selecionado: ${selectedProd.name}` : 'Selecione um produto do catálogo ou digite livremente'}
            </p>
          </div>

          {/* Quantidade e preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={lbl}>Quantidade *</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={inp()}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
            <div>
              <label style={lbl}>Preço Unitário *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={inp()}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          {/* Total calculado */}
          {total > 0 && (
            <div className="bg-brand-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-brand-700 font-medium">Total da Venda</span>
              <span className="font-display text-xl font-bold text-brand-700">{formatCurrency(total)}</span>
            </div>
          )}

          {/* Data da venda */}
          <div>
            <label style={lbl}>Data da Venda *</label>
            <input
              type="date"
              value={soldAt}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSoldAt(e.target.value)}
              style={inp()}
              onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={lbl}>Nome do Cliente</label>
              <input
                placeholder="Opcional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={inp()}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
            <div>
              <label style={lbl}>Telefone</label>
              <input
                placeholder="(51) 9 9999-9999"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={inp()}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <label style={lbl}>Forma de Pagamento</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'CASH',        label: '💵 Dinheiro' },
                { value: 'PIX',         label: '💚 PIX' },
                { value: 'CREDIT_CARD', label: '💳 Crédito' },
                { value: 'DEBIT_CARD',  label: '💳 Débito' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPayment(opt.value)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all text-center',
                    paymentMethod === opt.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-brand-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label style={lbl}>Observações</label>
            <textarea
              placeholder="Alguma observação sobre a venda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ ...inp(), resize: 'none', fontFamily: 'inherit' }}
              onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              : '✅ Registrar Venda'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
