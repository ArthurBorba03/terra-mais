export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  isActive: boolean
  sortOrder: number
  _count?: { products: number }
}

export interface Product {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string
  shortDesc?: string | null
  price: number
  comparePrice?: number | null
  stock: number
  sku?: string | null
  images: string[]
  isActive: boolean
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  isPromotion: boolean
  allowExtras: boolean
  tags: string[]
  category?: Category
  reviews?: Review[]
  _count?: { reviews: number }
  avgRating?: number
}

export interface Review {
  id: string
  productId: string
  customerId: string
  rating: number
  title?: string | null
  comment?: string | null
  isApproved: boolean
  createdAt: string
  customer?: { user: { name: string } }
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  extras?: CartExtras
  giftMessage?: string
}

export interface CartExtras {
  card?: boolean
  chocolate?: boolean
  balao?: boolean
  pelucia?: boolean
  cestaExtra?: boolean
}

export interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: (shippingCost?: number) => number
  getItemCount: () => number
}

export interface Coupon {
  id: string
  code: string
  description?: string | null
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  value: number
  minAmount?: number | null
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  deliveryType: 'PICKUP' | 'DELIVERY'
  deliveryDate?: string | null
  deliveryTime?: string | null
  giftMessage?: string | null
  createdAt: string
  items: OrderItem[]
  payment?: Payment | null
  address?: Address | null
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImg?: string | null
  quantity: number
  unitPrice: number
  extras?: CartExtras | null
}

export interface Payment {
  id: string
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
  amount: number
  pixCode?: string | null
  pixQrCode?: string | null
  installments: number
  paidAt?: string | null
}

export interface Address {
  id: string
  label: string
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export interface CheckoutData {
  // Customer
  name: string
  email: string
  phone: string
  cpf: string
  // Delivery
  deliveryType: 'PICKUP' | 'DELIVERY'
  address?: Omit<Address, 'id' | 'isDefault' | 'label'>
  deliveryDate: string
  deliveryTime: string
  // Gift
  recipientName?: string
  recipientPhone?: string
  giftMessage?: string
  // Payment
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
  installments?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller' | 'featured'
  search?: string
  page?: number
  limit?: number
  isPromotion?: boolean
  isFeatured?: boolean
  isBestseller?: boolean
  isNew?: boolean
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
  avgTicket: number
  recentOrders: Order[]
  topProducts: { product: Product; total: number }[]
}
