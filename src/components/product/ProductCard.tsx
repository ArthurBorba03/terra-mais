'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface Props {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: Props) {
  const { addItem } = useCart()
  const [liked, setLiked] = useState(false)
  const [adding, setAdding] = useState(false)

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    })
    toast.success(`${product.name} adicionado ao carrinho!`)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div className={cn('card group relative overflow-hidden', className)}>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isNew && (
          <span className="badge bg-brand-700 text-white text-xs">Novo</span>
        )}
        {product.isPromotion && discount > 0 && (
          <span className="price-discount">-{discount}%</span>
        )}
        {product.isBestseller && (
          <span className="badge bg-amber-100 text-amber-800 text-xs">Mais Vendido</span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        aria-label="Favoritar"
      >
        <Heart className={cn('w-4 h-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
      </button>

      {/* Image */}
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
          )}

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-brand-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="flex items-center gap-2 bg-white text-brand-700 text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
              <Eye className="w-4 h-4" /> Ver produto
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-leaf-600 font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating && product.avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-600">
                {product.avgRating.toFixed(1)} ({product._count?.reviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="price-current">{formatCurrency(product.price)}</span>
            {product.comparePrice && (
              <span className="price-old">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-orange-600 mt-1">Restam apenas {product.stock} unidades!</p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">Fora de estoque</p>
          )}
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : adding
              ? 'bg-brand-600 text-white scale-95'
              : 'bg-brand-50 text-brand-700 hover:bg-brand-700 hover:text-white'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? 'Adicionado!' : product.stock === 0 ? 'Indisponível' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}
