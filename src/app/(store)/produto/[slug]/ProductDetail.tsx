'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart, Star, Truck, Shield, ChevronRight,
  Minus, Plus, Heart, Share2, Check,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import ProductCard from '@/components/product/ProductCard'
import toast from 'react-hot-toast'
import type { Product, Review } from '@/types'

const EXTRAS = [
  { id: 'card',       label: '💌 Cartão com Mensagem',  price: 0  },
  { id: 'chocolate',  label: '🍫 Caixa de Chocolates',   price: 18 },
  { id: 'balao',      label: '🎈 Balão Personalizado',   price: 15 },
  { id: 'pelucia',    label: '🧸 Pelúcia',               price: 45 },
  { id: 'cestaExtra', label: '🧺 Cesta Complementar',    price: 60 },
]

interface ProductWithRelated extends Product {
  avgRating: number
  reviews: Review[]
  related: Product[]
}

export default function ProductDetail({ product }: { product: ProductWithRelated }) {
  const { addItem } = useCart()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})
  const [giftMessage, setGiftMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc')
  const [adding, setAdding] = useState(false)

  const extrasTotal = EXTRAS.filter((e) => selectedExtras[e.id]).reduce((s, e) => s + e.price, 0)
  const total = (product.price + extrasTotal) * qty
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = () => {
    setAdding(true)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price + extrasTotal,
      image: product.images[0] || '',
      quantity: qty,
      extras: selectedExtras as never,
      giftMessage: giftMessage || undefined,
    })
    toast.success('Produto adicionado ao carrinho! 🌿')
    setTimeout(() => setAdding(false), 800)
  }

  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand-700 transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/catalogo" className="hover:text-brand-700 transition-colors">Catálogo</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/catalogo?categoria=${product.category?.slug}`}
          className="hover:text-brand-700 transition-colors"
        >
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* ── Image gallery ── */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-4 shadow-card">
            {product.images[selectedImg] ? (
              <Image
                src={product.images[selectedImg]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🌸</div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 price-discount px-3 py-1.5 text-sm font-bold">
                -{discount}%
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200',
                    i === selectedImg
                      ? 'border-brand-600 shadow-md scale-105'
                      : 'border-transparent hover:border-brand-300 opacity-70 hover:opacity-100'
                  )}
                >
                  <Image src={img} alt="" width={80} height={80} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div>
          <p className="text-leaf-600 font-semibold text-sm mb-2 tracking-wide uppercase">
            {product.category?.name}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      'w-4 h-4',
                      s <= Math.round(product.avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.avgRating.toFixed(1)} · {product.reviews.length} avaliações
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display text-4xl font-bold text-brand-700">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && (
              <span className="price-old text-lg">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDesc && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5 border-l-4 border-brand-200 pl-4">
              {product.shortDesc}
            </p>
          )}

          {/* Stock indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                product.stock > 10
                  ? 'bg-green-500'
                  : product.stock > 0
                  ? 'bg-orange-400 animate-pulse'
                  : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-600">
              {product.stock > 10
                ? 'Em estoque'
                : product.stock > 0
                ? `⚡ Apenas ${product.stock} unidades restantes!`
                : 'Fora de estoque'}
            </span>
          </div>

          {/* Extras */}
          {product.allowExtras && (
            <div className="mb-6">
              <p className="font-semibold text-gray-800 mb-3 text-sm">
                Adicionar ao pedido (opcional):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXTRAS.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                      selectedExtras[extra.id]
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-brand-300 text-gray-600'
                    )}
                  >
                    <span>{extra.label}</span>
                    <span className="text-xs ml-2 flex-shrink-0">
                      {selectedExtras[extra.id] && <Check className="w-3.5 h-3.5 inline mr-1" />}
                      {extra.price > 0 ? `+${formatCurrency(extra.price)}` : 'Grátis'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gift message */}
          {(selectedExtras.card || product.allowExtras) && (
            <div className="mb-6">
              <label className="font-semibold text-gray-800 block mb-2 text-sm">
                💌 Mensagem para o cartão
                <span className="font-normal text-gray-400 ml-1">(opcional)</span>
              </label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Escreva uma mensagem especial que acompanhará o presente..."
                maxLength={300}
                rows={3}
                className="input-field text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {giftMessage.length}/300
              </p>
            </div>
          )}

          {/* Qty + Cart */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-3 hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-gray-800 min-w-[2.5rem] text-center text-lg">
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="px-3 py-3 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-base transition-all duration-200',
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : adding
                  ? 'bg-green-600 text-white scale-95'
                  : 'bg-brand-700 text-white hover:bg-brand-800 hover:shadow-lg hover:-translate-y-0.5'
              )}
            >
              {adding ? (
                <><Check className="w-5 h-5" /> Adicionado!</>
              ) : product.stock === 0 ? (
                'Indisponível'
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Adicionar · {formatCurrency(total)}</>
              )}
            </button>

            <button
              className="p-3.5 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-all"
              aria-label="Favoritar"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                navigator.share?.({ title: product.name, url: window.location.href })
              }}
              className="p-3.5 border-2 border-gray-200 rounded-xl hover:border-brand-300 hover:text-brand-600 transition-all"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Truck, text: 'Entrega no mesmo dia para pedidos até 14h' },
              { icon: Shield, text: 'Pagamento 100% seguro e protegido' },
            ].map((g, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3.5 bg-brand-50 rounded-xl"
              >
                <g.icon className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 leading-snug">{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mb-20">
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {(
            [
              { key: 'desc', label: 'Descrição' },
              { key: 'reviews', label: `Avaliações (${product.reviews.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-3.5 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'desc' && (
          <div className="prose prose-sm max-w-3xl text-gray-600 leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-3xl">
            {product.reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma avaliação aprovada ainda.</p>
                <p className="text-gray-400 text-sm mt-1">Seja o primeiro a avaliar este produto!</p>
              </div>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {r.customer?.user?.name || 'Cliente verificado'}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              'w-3.5 h-3.5',
                              s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="font-medium text-gray-700 text-sm mb-1">{r.title}</p>}
                  {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Related products ── */}
      {product.related.length > 0 && (
        <div>
          <h2 className="section-title mb-8">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
