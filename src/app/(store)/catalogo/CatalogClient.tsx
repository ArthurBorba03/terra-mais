'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import type { Category, Product } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  products: Product[]
  total: number
  totalPages: number
  categories: Category[]
  currentPage: number
  searchParams: Record<string, string>
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'bestseller', label: 'Mais Vendidos' },
]

export default function CatalogClient({
  products, total, totalPages, categories, currentPage, searchParams,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(true)
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '')
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

  const updateParams = (updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams(searchParams as Record<string, string>)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k)
    })
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  const currentCategory = searchParams.categoria
  const currentSort = searchParams.sort || 'newest'

  const Sidebar = () => (
    <aside className="w-full">
      {/* Search */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Buscar</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateParams({ search: searchInput || undefined })
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar produtos..."
            className="input-field text-sm py-2.5 flex-1"
          />
          <button type="submit" className="px-3 bg-brand-700 text-white rounded-xl hover:bg-brand-800 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Categorias</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateParams({ categoria: undefined })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                !currentCategory
                  ? 'bg-brand-700 text-white font-semibold'
                  : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              Todas as categorias
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParams({ categoria: cat.slug })}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  currentCategory === cat.slug
                    ? 'bg-brand-700 text-white font-semibold'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                )}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
                {cat._count && (
                  <span className="ml-1 text-xs opacity-60">({cat._count.products})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <button
          className="w-full flex items-center justify-between font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider"
          onClick={() => setPriceOpen(!priceOpen)}
        >
          Faixa de Preço
          {priceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {priceOpen && (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Mín R$"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field text-sm py-2 flex-1"
                min="0"
              />
              <span className="text-gray-400 flex-shrink-0">–</span>
              <input
                type="number"
                placeholder="Máx R$"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field text-sm py-2 flex-1"
                min="0"
              />
            </div>
            <button
              onClick={() => updateParams({
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
              })}
              className="w-full btn-primary text-sm py-2.5"
            >
              Aplicar Filtro
            </button>
          </div>
        )}
      </div>

      {/* Quick filters */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Filtros Rápidos</h3>
        <div className="space-y-2">
          {[
            { label: '🏷️ Promoções', key: 'promocao', value: 'true' },
            { label: '⭐ Em Destaque', key: 'destaque', value: 'true' },
            { label: '🔥 Mais Vendidos', key: 'maisVendidos', value: 'true' },
            { label: '✨ Novidades', key: 'novidades', value: 'true' },
          ].map((f) => (
            <label
              key={f.key}
              className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-600 hover:text-brand-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={searchParams[f.key] === f.value}
                onChange={(e) =>
                  updateParams({ [f.key]: e.target.checked ? f.value : undefined })
                }
                className="w-4 h-4 accent-brand-600 rounded"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {Object.keys(searchParams).filter((k) => k !== 'page').length > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Limpar Filtros
        </button>
      )}
    </aside>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-800">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Catálogo'
              : searchParams.search
              ? `Resultados para "${searchParams.search}"`
              : 'Catálogo'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden btn-secondary text-sm py-2 px-4 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="input-field text-sm py-2.5 w-auto min-w-[160px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar drawer */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-76 max-w-[85vw] bg-white p-6 overflow-y-auto shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-gray-800">Filtros</h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              <button onClick={() => router.push(pathname)} className="btn-primary text-sm">
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
              {currentPage > 1 && (
                <button
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-brand-500 hover:text-brand-700 transition-colors"
                >
                  ← Anterior
                </button>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: String(p) })}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
                      p === currentPage
                        ? 'bg-brand-700 text-white shadow-md'
                        : 'border border-gray-200 hover:border-brand-500 hover:text-brand-700'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              {currentPage < totalPages && (
                <button
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-brand-500 hover:text-brand-700 transition-colors"
                >
                  Próxima →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
