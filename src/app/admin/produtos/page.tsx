'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter, X, Edit, Trash2,
  Loader2, ChevronDown, Package, AlertTriangle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ── Tipos ─────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  stock: number
  images: string[]
  isActive: boolean
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  isPromotion: boolean
  allowExtras: boolean
  category: { id: string; name: string; icon?: string | null }
}

interface Category {
  id: string
  name: string
  icon?: string | null
}

// ── Constantes ────────────────────────────────────────────────
const OPCOES_FILTRO = [
  { key: 'isFeatured',   label: '⭐ Em Destaque' },
  { key: 'isBestseller', label: '🔥 Mais Vendido' },
  { key: 'isNew',        label: '✨ Novidade' },
  { key: 'isPromotion',  label: '🏷️ Promoção' },
  { key: 'allowExtras',  label: '🎁 Permite Extras' },
  { key: 'isActive',     label: '✅ Ativo' },
]

const ORDEM_OPCOES = [
  { value: 'name_asc',   label: 'Nome A→Z' },
  { value: 'name_desc',  label: 'Nome Z→A' },
  { value: 'price_asc',  label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'stock_asc',  label: 'Menor Estoque' },
  { value: 'stock_desc', label: 'Maior Estoque' },
  { value: 'new',        label: 'Mais Recentes' },
]

export default function ProdutosPage() {
  const [products, setProducts]       = useState<Product[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [loading, setLoading]         = useState(true)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deleteLoading, setDelLoad]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [total, setTotal]             = useState(0)

  // ── Filtros ───────────────────────────────────────────────
  const [search,      setSearch]      = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [priceMin,    setPriceMin]    = useState('')
  const [priceMax,    setPriceMax]    = useState('')
  const [stockMin,    setStockMin]    = useState('')
  const [stockMax,    setStockMax]    = useState('')
  const [opcoes,      setOpcoes]      = useState<string[]>([])
  const [ordem,       setOrdem]       = useState('new')

  // Conta filtros ativos
  const filtrosAtivos = [
    categoryId, priceMin, priceMax, stockMin, stockMax,
    ...opcoes,
  ].filter(Boolean).length

  // ── Carregar categorias ───────────────────────────────────
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
  }, [])

  // ── Carregar produtos ─────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (search)     params.set('search', search)
      if (categoryId) params.set('categoryId', categoryId)

      const res  = await fetch(`/api/products?${params}`)
      const data = await res.json()

      let list: Product[] = data.data || []

      // Filtros client-side (preço, estoque, opções)
      if (priceMin)  list = list.filter((p) => p.price >= parseFloat(priceMin))
      if (priceMax)  list = list.filter((p) => p.price <= parseFloat(priceMax))
      if (stockMin)  list = list.filter((p) => p.stock >= parseInt(stockMin))
      if (stockMax)  list = list.filter((p) => p.stock <= parseInt(stockMax))
      opcoes.forEach((op) => {
        list = list.filter((p) => p[op as keyof Product] === true)
      })

      // Ordenação
      list.sort((a, b) => {
        switch (ordem) {
          case 'name_asc':   return a.name.localeCompare(b.name)
          case 'name_desc':  return b.name.localeCompare(a.name)
          case 'price_asc':  return a.price - b.price
          case 'price_desc': return b.price - a.price
          case 'stock_asc':  return a.stock - b.stock
          case 'stock_desc': return b.stock - a.stock
          default:           return 0
        }
      })

      setProducts(list)
      setTotal(list.length)
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, priceMin, priceMax, stockMin, stockMax, opcoes, ordem])

  useEffect(() => { load() }, [load])

  // ── Limpar filtros ────────────────────────────────────────
  function limparFiltros() {
    setCategoryId('')
    setPriceMin('')
    setPriceMax('')
    setStockMin('')
    setStockMax('')
    setOpcoes([])
    setOrdem('new')
  }

  // ── Toggle opção ──────────────────────────────────────────
  function toggleOpcao(key: string) {
    setOpcoes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // ── Excluir produto ───────────────────────────────────────
  async function handleDelete() {
    if (!deleteId) return
    setDelLoad(true)
    try {
      await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      load()
    } finally {
      setDelLoad(false)
    }
  }

  // ── Estoque badge ─────────────────────────────────────────
  function stockBadge(stock: number) {
    if (stock === 0)  return { label: 'Sem estoque', color: 'bg-red-100 text-red-700' }
    if (stock <= 3)   return { label: `${stock} restantes`, color: 'bg-orange-100 text-orange-700' }
    if (stock <= 10)  return { label: `${stock} un.`, color: 'bg-yellow-100 text-yellow-700' }
    return               { label: `${stock} un.`, color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/produtos/new" className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Link>
      </div>

      {/* Barra de busca + filtros */}
      <div className="card p-4 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome do produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Categoria */}
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field text-sm pr-10 appearance-none min-w-[160px]"
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Ordenação */}
          <div className="relative">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="input-field text-sm pr-10 appearance-none min-w-[150px]"
            >
              {ORDEM_OPCOES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Botão filtros avançados */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              showFilters || filtrosAtivos > 0
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {filtrosAtivos}
              </span>
            )}
          </button>

          {filtrosAtivos > 0 && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" /> Limpar
            </button>
          )}
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <div className="border-t border-gray-100 pt-4 space-y-4">

            {/* Filtro por preço */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                💰 Preço (R$)
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={priceMin}
                  min={0}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="input-field text-sm w-32"
                />
                <span className="text-gray-400 text-sm">até</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={priceMax}
                  min={0}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="input-field text-sm w-32"
                />
                {(priceMin || priceMax) && (
                  <button onClick={() => { setPriceMin(''); setPriceMax('') }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por estoque */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                📦 Estoque (unidades)
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={stockMin}
                  min={0}
                  onChange={(e) => setStockMin(e.target.value)}
                  className="input-field text-sm w-32"
                />
                <span className="text-gray-400 text-sm">até</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={stockMax}
                  min={0}
                  onChange={(e) => setStockMax(e.target.value)}
                  className="input-field text-sm w-32"
                />
                {(stockMin || stockMax) && (
                  <button onClick={() => { setStockMin(''); setStockMax('') }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                )}

                {/* Atalhos de estoque */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: 'Sem estoque', min: '0', max: '0' },
                    { label: 'Crítico (≤3)', min: '0', max: '3' },
                    { label: 'Baixo (≤10)', min: '0', max: '10' },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={() => { setStockMin(a.min); setStockMax(a.max) }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        stockMin === a.min && stockMax === a.max
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtro por opções */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🏷️ Opções do Produto
              </p>
              <div className="flex flex-wrap gap-2">
                {OPCOES_FILTRO.map((op) => (
                  <button
                    key={op.key}
                    onClick={() => toggleOpcao(op.key)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                      opcoes.includes(op.key)
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
              {opcoes.length > 0 && (
                <p className="text-xs text-brand-600 mt-2 font-medium">
                  Mostrando produtos que têm TODAS as opções selecionadas
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags dos filtros ativos */}
      {filtrosAtivos > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {categories.find((c) => c.id === categoryId)?.name}
              <button onClick={() => setCategoryId('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(priceMin || priceMax) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Preço: R${priceMin || '0'} – R${priceMax || '∞'}
              <button onClick={() => { setPriceMin(''); setPriceMax('') }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(stockMin || stockMax) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              Estoque: {stockMin || '0'} – {stockMax || '∞'} un.
              <button onClick={() => { setStockMin(''); setStockMax('') }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {opcoes.map((op) => (
            <span key={op} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {OPCOES_FILTRO.find((o) => o.key === op)?.label}
              <button onClick={() => toggleOpcao(op)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Lista de produtos */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros ou crie um novo produto</p>
            {filtrosAtivos > 0 && (
              <button onClick={limparFiltros} className="mt-4 text-brand-600 text-sm font-medium hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Produto', 'Categoria', 'Preço', 'Estoque', 'Opções', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const sb = stockBadge(p.stock)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      {/* Produto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              : '🌸'
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-xs text-gray-400 font-mono truncate max-w-[180px]">{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap">
                          {p.category?.icon} {p.category?.name}
                        </span>
                      </td>

                      {/* Preço */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-brand-700">{formatCurrency(p.price)}</p>
                          {p.comparePrice && (
                            <p className="text-xs text-gray-400 line-through">{formatCurrency(p.comparePrice)}</p>
                          )}
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2.5 py-1 rounded-lg font-medium', sb.color)}>
                          {sb.label}
                        </span>
                      </td>

                      {/* Opções */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured   && <span className="text-xs">⭐</span>}
                          {p.isBestseller && <span className="text-xs">🔥</span>}
                          {p.isNew        && <span className="text-xs">✨</span>}
                          {p.isPromotion  && <span className="text-xs">🏷️</span>}
                          {p.allowExtras  && <span className="text-xs">🎁</span>}
                          {!p.isFeatured && !p.isBestseller && !p.isNew && !p.isPromotion && !p.allowExtras && (
                            <span className="text-gray-300 text-xs">–</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2.5 py-1 rounded-lg font-medium',
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        )}>
                          {p.isActive ? '✅ Ativo' : '⏸️ Inativo'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/produtos/${p.id}`}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Rodapé */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
              <span>{products.length} produto{products.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-4">
                <span>
                  Estoque total: <strong className="text-gray-700">
                    {products.reduce((s, p) => s + p.stock, 0)} un.
                  </strong>
                </span>
                <span>
                  Valor médio: <strong className="text-brand-700">
                    {formatCurrency(products.reduce((s, p) => s + p.price, 0) / (products.length || 1))}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmar exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-gray-800">Excluir Produto?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Esta ação não pode ser desfeita. O produto será removido permanentemente.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
