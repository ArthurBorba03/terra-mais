'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, formatPhone, cn } from '@/lib/utils'
import {
  CreditCard, QrCode, MapPin, Store, Calendar,
  MessageSquare, Tag, ChevronRight, Loader2, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

const STEPS = ['Dados Pessoais', 'Entrega', 'Pagamento']
const TIME_SLOTS = [
  '08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00',
  '14:00 – 16:00', '16:00 – 18:00', '18:00 – 20:00',
]

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items, getSubtotal, getDiscount, getTotal,
    coupon, applyCoupon, removeCoupon, clearCart,
  } = useCart()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const shippingCost = 15
  const [pixData, setPixData] = useState<{ code: string; qrCode: string } | null>(null)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: 'DELIVERY',
      paymentMethod: 'PIX',
      installments: 1,
    },
  })

  const deliveryType = watch('deliveryType')
  const paymentMethod = watch('paymentMethod')
  const deliveryTime = watch('deliveryTime')

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-8">
        <div className="text-7xl">🛒</div>
        <h2 className="font-display text-2xl font-bold text-gray-700">Carrinho vazio</h2>
        <p className="text-gray-500">Adicione produtos antes de finalizar a compra.</p>
        <Link href="/catalogo" className="btn-primary">Ver Catálogo</Link>
      </div>
    )
  }

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: getSubtotal() }),
      })
      const data = await res.json()
      if (data.success) {
        applyCoupon(data.data)
        toast.success('Cupom aplicado! 🎉')
        setCouponCode('')
      } else {
        toast.error(data.error || 'Cupom inválido')
      }
    } finally {
      setCouponLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true)
    try {
      const effectiveShipping = deliveryType === 'PICKUP' ? 0 : shippingCost
      const payload = {
        ...data,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
          extras: i.extras,
        })),
        subtotal: getSubtotal(),
        shippingCost: effectiveShipping,
        discount: getDiscount(),
        total: getTotal(effectiveShipping),
        couponCode: coupon?.code,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Erro ao criar pedido')

      if (data.paymentMethod === 'PIX' && result.data.payment) {
        setPixData({
          code: result.data.payment.pixCode || '',
          qrCode: result.data.payment.pixQrCode || '',
        })
        clearCart()
      } else {
        clearCart()
        router.push(`/pedido-confirmado?id=${result.data.order.id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao finalizar pedido')
    } finally {
      setLoading(false)
    }
  }

  const effectiveShipping = deliveryType === 'PICKUP' ? 0 : shippingCost
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal(effectiveShipping)

  // PIX confirmation screen
  if (pixData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <QrCode className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Pague com PIX para confirmar seu pedido. Você tem 30 minutos.
          </p>

          {pixData.qrCode && (
            <div className="bg-gray-50 rounded-2xl p-5 inline-block mb-6">
              <Image src={pixData.qrCode} alt="QR Code PIX" width={180} height={180} className="mx-auto" />
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Código PIX Copia e Cola</p>
            <p className="text-xs font-mono text-gray-700 break-all leading-relaxed select-all">
              {pixData.code}
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(pixData.code)
              toast.success('Código copiado!')
            }}
            className="btn-primary w-full mb-3"
          >
            Copiar Código PIX
          </button>
          <Link href="/" className="btn-ghost w-full text-sm">Voltar para a loja</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-800 mb-8">
        Finalizar Compra
      </h1>

      {/* Stepper */}
      <div className="flex items-center mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2',
                i <= step ? 'text-brand-700' : 'text-gray-400'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  i < step
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : i === step
                    ? 'border-brand-700 text-brand-700 bg-brand-50'
                    : 'border-gray-300 text-gray-400'
                )}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-sm font-medium whitespace-nowrap hidden sm:block',
                  i === step && 'font-bold'
                )}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-16 mx-2 flex-shrink-0 transition-colors',
                  i < step ? 'bg-brand-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* STEP 0 – Personal data */}
            {step === 0 && (
              <div className="card p-7">
                <h2 className="font-display text-xl font-bold text-gray-800 mb-6">Seus Dados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome completo *</label>
                    <input {...register('name')} placeholder="Maria Silva" className={cn('input-field', errors.name && 'border-red-400')} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail *</label>
                    <input {...register('email')} type="email" placeholder="maria@email.com" className={cn('input-field', errors.email && 'border-red-400')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Telefone *</label>
                    <input
                      {...register('phone')}
                      placeholder="(51) 9 9999-9999"
                      onChange={(e) => setValue('phone', formatPhone(e.target.value))}
                      className={cn('input-field', errors.phone && 'border-red-400')}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">CPF *</label>
                    <input
                      {...register('cpf')}
                      placeholder="000.000.000-00"
                      onChange={(e) => setValue('cpf', e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className={cn('input-field', errors.cpf && 'border-red-400')}
                    />
                    {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-primary mt-6 flex items-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 1 – Delivery */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="card p-7">
                  <h2 className="font-display text-xl font-bold text-gray-800 mb-5">Forma de Entrega</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-0">
                    {[
                      { value: 'DELIVERY', icon: MapPin, label: 'Entrega em domicílio', desc: `Taxa: ${formatCurrency(shippingCost)}` },
                      { value: 'PICKUP', icon: Store, label: 'Retirar na loja', desc: 'Grátis • Avenida Marechal Rondon, 3742' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('deliveryType', opt.value as 'DELIVERY' | 'PICKUP')}
                        className={cn(
                          'p-5 rounded-2xl border-2 text-left transition-all',
                          deliveryType === opt.value
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-brand-300'
                        )}
                      >
                        <opt.icon className={cn('w-5 h-5 mb-2', deliveryType === opt.value ? 'text-brand-600' : 'text-gray-400')} />
                        <p className={cn('font-semibold text-sm', deliveryType === opt.value ? 'text-brand-700' : 'text-gray-700')}>{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {deliveryType === 'DELIVERY' && (
                  <div className="card p-7">
                    <h3 className="font-semibold text-gray-800 mb-5">Endereço de Entrega</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">CEP *</label>
                        <input
                          {...register('address.zipCode')}
                          placeholder="00000-000"
                          onChange={(e) => setValue('address.zipCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Estado *</label>
                        <input {...register('address.state')} placeholder="RS" maxLength={2} className="input-field uppercase" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Rua / Avenida *</label>
                        <input {...register('address.street')} placeholder="Avenida Marechal Rondon" className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Número *</label>
                        <input {...register('address.number')} placeholder="3742" className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Complemento</label>
                        <input {...register('address.complement')} placeholder="Apto 1" className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Bairro *</label>
                        <input {...register('address.district')} placeholder="Vila Fátima" className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Cidade *</label>
                        <input {...register('address.city')} placeholder="Cachoeirinha" className="input-field" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="card p-7">
                  <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-600" /> Agendamento
                  </h3>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Data de Entrega *</label>
                    <input
                      {...register('deliveryDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field max-w-xs"
                    />
                    {errors.deliveryDate && <p className="text-red-500 text-xs mt-1">{errors.deliveryDate.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Horário preferencial *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setValue('deliveryTime', slot)}
                          className={cn(
                            'py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all',
                            deliveryTime === slot
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-gray-200 hover:border-brand-300 text-gray-600'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.deliveryTime && <p className="text-red-500 text-xs mt-1">{errors.deliveryTime.message}</p>}
                  </div>
                </div>

                <div className="card p-7">
                  <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-600" /> Mensagem para o Presente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome do destinatário</label>
                      <input {...register('recipientName')} placeholder="Para quem é o presente?" className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Telefone do destinatário</label>
                      <input {...register('recipientPhone')} placeholder="(51) 9 9999-9999" className="input-field" />
                    </div>
                  </div>
                  <textarea
                    {...register('giftMessage')}
                    placeholder="Escreva uma mensagem que acompanhará o presente..."
                    rows={3}
                    maxLength={300}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Voltar</button>
                  <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">
                    Ir para Pagamento <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 – Payment */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="card p-7">
                  <h2 className="font-display text-xl font-bold text-gray-800 mb-5">Forma de Pagamento</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { value: 'PIX', icon: QrCode, label: 'PIX', desc: '5% de desconto' },
                      { value: 'CREDIT_CARD', icon: CreditCard, label: 'Crédito', desc: 'Até 12x' },
                      { value: 'DEBIT_CARD', icon: CreditCard, label: 'Débito', desc: 'À vista' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('paymentMethod', opt.value as 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD')}
                        className={cn(
                          'p-5 rounded-2xl border-2 text-left transition-all',
                          paymentMethod === opt.value
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-brand-300'
                        )}
                      >
                        <opt.icon className={cn('w-5 h-5 mb-2', paymentMethod === opt.value ? 'text-brand-600' : 'text-gray-400')} />
                        <p className={cn('font-semibold text-sm', paymentMethod === opt.value ? 'text-brand-700' : 'text-gray-700')}>{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'PIX' && (
                    <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <QrCode className="w-6 h-6 text-green-600" />
                        <p className="font-semibold text-green-800">Pague com PIX</p>
                      </div>
                      <p className="text-sm text-green-700 leading-relaxed">
                        O QR Code será gerado após confirmar o pedido. Você terá 30 minutos para realizar o pagamento.
                      </p>
                      <p className="text-xs font-bold text-green-700 mt-2">🎉 Ganhe 5% de desconto pagando com PIX!</p>
                    </div>
                  )}

                  {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Número do Cartão</label>
                        <input placeholder="0000 0000 0000 0000" className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1.5">Validade</label>
                          <input placeholder="MM/AA" className="input-field" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1.5">CVV</label>
                          <input placeholder="123" className="input-field" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome no Cartão</label>
                        <input placeholder="MARIA A SILVA" className="input-field uppercase" />
                      </div>
                      {paymentMethod === 'CREDIT_CARD' && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1.5">Parcelas</label>
                          <select
                            {...register('installments', { valueAsNumber: true })}
                            className="input-field"
                          >
                            {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                              <option key={n} value={n}>
                                {n}x de {formatCurrency(total / n)}{n > 1 ? ' sem juros' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Voltar</button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-4 text-base"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                    ) : (
                      <><Lock className="w-5 h-5" /> Confirmar Pedido · {formatCurrency(total)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-5">Resumo do Pedido</h3>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Cupom de desconto"
                    className="input-field text-sm py-2.5 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCouponCode())}
                  />
                  <button
                    type="button"
                    onClick={applyCouponCode}
                    disabled={couponLoading}
                    className="px-3 bg-brand-700 text-white rounded-xl hover:bg-brand-800 disabled:opacity-50 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between mt-2 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                    <span className="text-xs text-green-700 font-semibold">✅ {coupon.code}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Desconto ({coupon?.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>
                    {effectiveShipping === 0
                      ? <span className="text-green-600 font-semibold">Grátis</span>
                      : formatCurrency(effectiveShipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-brand-700 pt-3 border-t border-gray-100 mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-brand-50 rounded-xl text-center">
                <p className="text-xs text-brand-700 font-medium">🔒 Compra 100% segura e protegida</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
