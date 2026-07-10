'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface Props { open: boolean; onClose: () => void }

export default function SearchBar({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setResults([])
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
        const data = await res.json()
        setResults(data.data || [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full shadow-2xl animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 border-2 border-brand-500 rounded-2xl px-4 py-3">
            <Search className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar flores, plantas, buquês..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 outline-none text-gray-800 text-lg placeholder:text-gray-400"
            />
            {loading && <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />}
            {query && !loading && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/produto/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} width={56} height={56} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                  </div>
                  <span className="font-bold text-brand-700 flex-shrink-0">{formatCurrency(product.price)}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 text-center">
                <Link
                  href={`/catalogo?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-sm text-brand-700 hover:text-brand-800 font-medium"
                >
                  Ver todos os resultados para "{query}" →
                </Link>
              </div>
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">
              Nenhum resultado encontrado para "{query}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
