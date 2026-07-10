'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, cn } from '@/lib/utils'

interface Props { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, coupon, getDiscount } = useCart()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const subtotal = getSubtotal()
  const discount = getDiscount()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn('fixed inset-0 bg-black/50 z-50 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-brand-700" />
            <h2 className="font-display font-bold text-xl text-gray-800">Carrinho</h2>
            <span className="badge bg-brand-100 text-brand-700">{getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 font-medium">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-sm mt-1">Adicione flores e plantas para continuar</p>
              <button onClick={onClose} className="mt-6 btn-primary text-sm">Explorar Catálogo</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-brand-700 font-bold mt-1">{formatCurrency(item.price)}</p>
                  {item.giftMessage && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">💌 {item.giftMessage}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {coupon && discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({coupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-700">{formatCurrency(subtotal - discount)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full text-base py-4 justify-center"
            >
              Finalizar Compra
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/catalogo"
              onClick={onClose}
              className="btn-ghost w-full text-sm justify-center"
            >
              Continuar Comprando
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
