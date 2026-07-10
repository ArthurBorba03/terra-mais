import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  cpf: z.string().length(11, 'CPF inválido').optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().min(2, 'Slug obrigatório'),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  description: z.string().min(10, 'Descrição obrigatória'),
  shortDesc: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1, 'Pelo menos uma imagem'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPromotion: z.boolean().default(false),
  allowExtras: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().min(2, 'Slug obrigatório'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const addressSchema = z.object({
  label: z.string().default('Casa'),
  street: z.string().min(2, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  district: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  zipCode: z.string().min(8, 'CEP inválido'),
})

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  address: addressSchema.optional(),
  deliveryDate: z.string().min(1, 'Data de entrega obrigatória'),
  deliveryTime: z.string().min(1, 'Horário obrigatório'),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  giftMessage: z.string().max(300).optional(),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD']),
  installments: z.number().int().min(1).max(12).optional(),
})

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(500).optional(),
})

export const couponSchema = z.object({
  code: z.string().min(3, 'Código obrigatório').max(20),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.number().positive(),
  minAmount: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CouponInput = z.infer<typeof couponSchema>
