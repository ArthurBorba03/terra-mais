'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState, Coupon } from '@/types'

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (item: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon: Coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getDiscount: () => {
        const { coupon } = get()
        const subtotal = get().getSubtotal()
        if (!coupon) return 0
        if (coupon.type === 'PERCENTAGE') {
          return (subtotal * coupon.value) / 100
        }
        if (coupon.type === 'FIXED') {
          return Math.min(coupon.value, subtotal)
        }
        return 0
      },

      getTotal: (shippingCost = 0) => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const isFreeShipping = get().coupon?.type === 'FREE_SHIPPING'
        const shipping = isFreeShipping ? 0 : shippingCost
        return Math.max(0, subtotal - discount + shipping)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'terra-mais-cart',
    }
  )
)
