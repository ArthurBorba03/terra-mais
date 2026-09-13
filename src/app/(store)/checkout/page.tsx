'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, formatPhone } from '@/lib/utils'
import {
  MapPin, Store, Calendar, MessageSquare,
  Tag, ChevronRight, Loader2, Lock, QrCode,
  CreditCard, CheckCircle, AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// ── Endereço da floricultura ──────────────────────────────────
const STORE_ADDRESS = 'Avenida Marechal Rondon, 3742, Gravataí, RS'
const STORE_LAT = -29.899739   // latitude da loja (ajuste para o endereço real)
const STORE_LNG = -51.065633   // longitude da loja (ajuste para o endereço real)

// ── Regras de frete por km ────────────────────────────────────
function calcFrete(km: number): number {
  if (km <= 5) return 10
  if (km <= 8) return 15
  return 20
}

const TIME_SLOTS = [
  '08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00',
  '14:00 – 16:00', '16:00 – 18:00', '18:00 – 20:00',
]

const STEPS = ['Dados Pessoais', 'Entrega', 'Pagamento']

// ── Calcular distância (fórmula Haversine) ────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Buscar lat/lng pelo CEP (ViaCEP + Nominatim) ─────────────
async function geocodeCEP(cep: string, street: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${street}, ${city}, RS, Brasil`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await res.json()
    if (data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, getDiscount, coupon, applyCoupon, removeCoupon, clearCart } = useCart()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [pixData, setPixData] = useState<{ code: string; qrCode: string } | null>(null)

  // Etapa 1
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erros1, setErros1] = useState<Record<string, string>>({})

  // Etapa 2
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY')
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('RS')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [erros2, setErros2] = useState<Record<string, string>>({})
  const [freteKm, setFreteKm] = useState<number | null>(null)
  const [calcuandoFrete, setCalculandoFrete] = useState(false)
  const [freteMsg, setFreteMsg] = useState('')

  // Etapa 3
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'>('PIX')
  const [installments, setInstallments] = useState(1)

  // ── Buscar CEP ────────────────────────────────────────────────
  async function handleCEP(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setCep(digits)
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setRua(data.logradouro || '')
          setBairro(data.bairro || '')
          setCidade(data.localidade || '')
          setEstado(data.uf || 'RS')
        }
      } catch { /* ignora */ }
    }
  }

  // ── Calcular frete por km ──────────────────────────────────
  async function calcularFrete() {
    if (!rua || !cidade) return
    setCalculandoFrete(true)
    setFreteMsg('')
    const coords = await geocodeCEP(cep, `${rua} ${numero}`, cidade)
    if (coords) {
      const km = haversineKm(STORE_LAT, STORE_LNG, coords.lat, coords.lng)
      const kmArredondado = Math.round(km * 10) / 10
      setFreteKm(kmArredondado)
      const frete = calcFrete(km)
      setFreteMsg(`📍 ${kmArredondado} km da loja — frete: ${formatCurrency(frete)}`)
    } else {
      setFreteMsg('Não foi possível calcular a distância. Frete padrão R$ 15,00 aplicado.')
      setFreteKm(6) // frete médio como fallback
    }
    setCalculandoFrete(false)
  }

  // ── Valores calculados ────────────────────────────────────
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shippingCost = deliveryType === 'PICKUP' ? 0 : (freteKm !== null ? calcFrete(freteKm) : 15)
  const total = Math.max(0, subtotal - discount + shippingCost)

  // ── Cupom ─────────────────────────────────────────────────
  async function applyCouponCode() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (data.success) { applyCoupon(data.data); setCouponCode('') }
      else alert(data.error || 'Cupom inválido')
    } finally { setCouponLoading(false) }
  }

  // ── Validar etapa 1 ───────────────────────────────────────
  function validarEtapa1() {
    const e: Record<string, string> = {}
    if (!nome.trim() || nome.trim().length < 2) e.nome = 'Nome obrigatório (mín. 2 caracteres)'
    if (!telefone || telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    setErros1(e)
    return Object.keys(e).length === 0
  }

  // ── Validar etapa 2 ───────────────────────────────────────
  function validarEtapa2() {
    const e: Record<string, string> = {}
    if (!deliveryDate) e.deliveryDate = 'Selecione uma data'
    if (!deliveryTime) e.deliveryTime = 'Selecione um horário'
    if (deliveryType === 'DELIVERY') {
      if (!rua) e.rua = 'Rua obrigatória'
      if (!numero) e.numero = 'Número obrigatório'
      if (!bairro) e.bairro = 'Bairro obrigatório'
      if (!cidade) e.cidade = 'Cidade obrigatória'
      if (!cep || cep.length < 8) e.cep = 'CEP inválido'
    }
    setErros2(e)
    return Object.keys(e).length === 0
  }

  // ── Submeter pedido ────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true)
    try {
      const payload = {
        name: nome,
        phone: telefone,
        email: `${telefone.replace(/\D/g, '')}@cliente.terramais.com.br`,
        cpf: '00000000000',
        deliveryType,
        address: deliveryType === 'DELIVERY' ? {
          street: rua, number: numero, complement: complemento,
          district: bairro, city: cidade, state: estado, zipCode: cep,
        } : undefined,
        deliveryDate,
        deliveryTime,
        recipientName,
        recipientPhone,
        giftMessage,
        paymentMethod,
        installments,
        items: items.map((i) => ({
          productId: i.productId, quantity: i.quantity,
          unitPrice: i.price, extras: i.extras,
        })),
        subtotal,
        shippingCost,
        discount,
        total,
        couponCode: coupon?.code,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Erro ao criar pedido')

      if (paymentMethod === 'PIX' && result.data.payment) {
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
      alert(err instanceof Error ? err.message : 'Erro ao finalizar pedido')
    } finally {
      setLoading(false)
    }
  }

  // ── Tela vazia ────────────────────────────────────────────
  if (items.length === 0 && !pixData) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 64 }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, color: '#374151', margin: 0 }}>Carrinho vazio</h2>
        <Link href="/catalogo" style={{ background: '#1e5522', color: '#fff', padding: '12px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>
          Ver Catálogo
        </Link>
      </div>
    )
  }

  // ── Tela PIX ──────────────────────────────────────────────
  if (pixData) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle style={{ width: 36, height: 36, color: '#16a34a' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, color: '#111', margin: '0 0 8px' }}>Pedido Realizado!</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>Pague com PIX para confirmar. Você tem 30 minutos.</p>
        {pixData.qrCode && (
          <div style={{ background: '#f9fafb', borderRadius: 16, padding: 20, display: 'inline-block', marginBottom: 20 }}>
            <Image src={pixData.qrCode} alt="QR Code PIX" width={180} height={180} />
          </div>
        )}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Código Copia e Cola</p>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151', wordBreak: 'break-all', margin: 0, lineHeight: 1.6 }}>{pixData.code}</p>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(pixData.code); alert('Código copiado!') }}
          style={{ width: '100%', padding: '14px', background: '#1e5522', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}
        >
          Copiar Código PIX
        </button>
        <Link href="/" style={{ display: 'block', color: '#1e5522', fontWeight: 500, fontSize: 14 }}>Voltar para a loja</Link>
      </div>
    )
  }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111', outline: 'none',
    boxSizing: 'border-box', background: '#fff', ...extra,
  })
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const err: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 4 }
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 16 }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 700, color: '#1e5522', margin: '0 0 28px' }}>
        Finalizar Compra
      </h1>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: i <= step ? '#1e5522' : '#9ca3af' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 13, fontWeight: 700, border: '2px solid',
                borderColor: i < step ? '#1e5522' : i === step ? '#1e5522' : '#d1d5db',
                background: i < step ? '#1e5522' : i === step ? '#f0fdf4' : '#fff',
                color: i < step ? '#fff' : i === step ? '#1e5522' : '#9ca3af',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 14, fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, width: 48, margin: '0 8px', background: i < step ? '#1e5522' : '#e5e7eb', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ══ CONTEÚDO PRINCIPAL ══ */}
        <div>

          {/* ── ETAPA 1: Dados pessoais ── */}
          {step === 0 && (
            <div style={card}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 20px' }}>
                Seus Dados
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={lbl}>Nome completo *</label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Maria Silva"
                    style={inp({ borderColor: erros1.nome ? '#ef4444' : '#e5e7eb' })}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e) => (e.target.style.borderColor = erros1.nome ? '#ef4444' : '#e5e7eb')}
                  />
                  {erros1.nome && <p style={err}>{erros1.nome}</p>}
                </div>
                <div>
                  <label style={lbl}>Telefone / WhatsApp *</label>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(51) 9 9999-9999"
                    maxLength={16}
                    style={inp({ borderColor: erros1.telefone ? '#ef4444' : '#e5e7eb' })}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e) => (e.target.style.borderColor = erros1.telefone ? '#ef4444' : '#e5e7eb')}
                  />
                  {erros1.telefone && <p style={err}>{erros1.telefone}</p>}
                </div>
              </div>
              <button
                onClick={() => { if (validarEtapa1()) setStep(1) }}
                style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: '#1e5522', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Continuar <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}

          {/* ── ETAPA 2: Entrega ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Tipo de entrega */}
              <div style={card}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                  Forma de Entrega
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { value: 'DELIVERY', icon: MapPin, label: 'Entrega em domicílio', desc: 'Calculado pelo CEP' },
                    { value: 'PICKUP', icon: Store, label: 'Retirar na loja', desc: 'Grátis • ' + STORE_ADDRESS.split(',')[0] },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryType(opt.value as 'DELIVERY' | 'PICKUP')}
                      style={{
                        padding: '16px', borderRadius: 14, border: '2px solid',
                        borderColor: deliveryType === opt.value ? '#1e5522' : '#e5e7eb',
                        background: deliveryType === opt.value ? '#f0fdf4' : '#fff',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <opt.icon style={{ width: 18, height: 18, marginBottom: 8, color: deliveryType === opt.value ? '#1e5522' : '#9ca3af' }} />
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: deliveryType === opt.value ? '#1e5522' : '#374151' }}>{opt.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endereço — só se for entrega */}
              {deliveryType === 'DELIVERY' && (
                <div style={card}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                    Endereço de Entrega
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={lbl}>CEP *</label>
                      <input
                        value={cep.replace(/(\d{5})(\d)/, '$1-$2')}
                        onChange={(e) => handleCEP(e.target.value)}
                        placeholder="00000-000"
                        style={inp({ borderColor: erros2.cep ? '#ef4444' : '#e5e7eb' })}
                        onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                      />
                      {erros2.cep && <p style={err}>{erros2.cep}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Estado</label>
                      <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lbl}>Rua / Avenida *</label>
                      <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua das Flores" style={inp({ borderColor: erros2.rua ? '#ef4444' : '#e5e7eb' })} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      {erros2.rua && <p style={err}>{erros2.rua}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Número *</label>
                      <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" style={inp({ borderColor: erros2.numero ? '#ef4444' : '#e5e7eb' })} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      {erros2.numero && <p style={err}>{erros2.numero}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Complemento</label>
                      <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto 42" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div>
                      <label style={lbl}>Bairro *</label>
                      <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" style={inp({ borderColor: erros2.bairro ? '#ef4444' : '#e5e7eb' })} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      {erros2.bairro && <p style={err}>{erros2.bairro}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Cidade *</label>
                      <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Gravataí" style={inp({ borderColor: erros2.cidade ? '#ef4444' : '#e5e7eb' })} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      {erros2.cidade && <p style={err}>{erros2.cidade}</p>}
                    </div>
                  </div>

                  {/* Calcular frete */}
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={calcularFrete}
                      disabled={calcuandoFrete || !rua || !cidade}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', background: calcuandoFrete || !rua ? '#e5e7eb' : '#f0fdf4',
                        color: calcuandoFrete || !rua ? '#9ca3af' : '#1e5522',
                        border: '1.5px solid', borderColor: calcuandoFrete || !rua ? '#e5e7eb' : '#bbf7d0',
                        borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: !rua ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {calcuandoFrete
                        ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Calculando...</>
                        : '📍 Calcular frete'}
                    </button>
                    {freteMsg && (
                      <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#166534', fontWeight: 500 }}>
                        {freteMsg}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agendamento */}
              <div style={card}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar style={{ width: 18, height: 18, color: '#1e5522' }} /> Agendamento
                </h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Data de Entrega *</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    style={inp({ maxWidth: 220, borderColor: erros2.deliveryDate ? '#ef4444' : '#e5e7eb' })}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  {erros2.deliveryDate && <p style={err}>{erros2.deliveryDate}</p>}
                </div>
                <div>
                  <label style={lbl}>Horário preferencial *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setDeliveryTime(slot)}
                        style={{
                          padding: '10px 4px', borderRadius: 10, border: '2px solid',
                          borderColor: deliveryTime === slot ? '#1e5522' : '#e5e7eb',
                          background: deliveryTime === slot ? '#f0fdf4' : '#fff',
                          color: deliveryTime === slot ? '#1e5522' : '#374151',
                          fontSize: 12, fontWeight: deliveryTime === slot ? 700 : 400, cursor: 'pointer',
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {erros2.deliveryTime && <p style={err}>{erros2.deliveryTime}</p>}
                </div>
              </div>

              {/* Mensagem para o presente */}
              <div style={card}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare style={{ width: 18, height: 18, color: '#1e5522' }} /> Mensagem para o Presente
                  <span style={{ fontWeight: 400, fontSize: 13, color: '#9ca3af' }}>(opcional)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Nome do destinatário</label>
                    <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Para quem é?" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                  <div>
                    <label style={lbl}>Telefone do destinatário</label>
                    <input value={recipientPhone} onChange={(e) => setRecipientPhone(formatPhone(e.target.value))} placeholder="(51) 9 9999-9999" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                </div>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Escreva uma mensagem especial..."
                  style={{ ...inp(), resize: 'vertical', fontFamily: 'inherit' }}
                  onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ padding: '13px 24px', background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  ← Voltar
                </button>
                <button
                  onClick={() => { if (validarEtapa2()) setStep(2) }}
                  style={{ flex: 1, padding: '13px', background: '#1e5522', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Ir para Pagamento <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── ETAPA 3: Pagamento ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={card}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
                  Forma de Pagamento
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[
                    { value: 'PIX', icon: QrCode, label: 'PIX', desc: '5% de desconto' },
                    { value: 'CREDIT_CARD', icon: CreditCard, label: 'Crédito', desc: 'Até 12x' },
                    { value: 'DEBIT_CARD', icon: CreditCard, label: 'Débito', desc: 'À vista' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value as typeof paymentMethod)}
                      style={{
                        padding: '14px 8px', borderRadius: 12, border: '2px solid',
                        borderColor: paymentMethod === opt.value ? '#1e5522' : '#e5e7eb',
                        background: paymentMethod === opt.value ? '#f0fdf4' : '#fff',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <opt.icon style={{ width: 18, height: 18, marginBottom: 6, color: paymentMethod === opt.value ? '#1e5522' : '#9ca3af' }} />
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: paymentMethod === opt.value ? '#1e5522' : '#374151' }}>{opt.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'PIX' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#166534', fontSize: 14 }}>💚 Pague com PIX</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#166534' }}>O QR Code será gerado após confirmar. Você terá 30 minutos para pagar.</p>
                  </div>
                )}

                {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={lbl}>Número do Cartão</label>
                      <input placeholder="0000 0000 0000 0000" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={lbl}>Validade</label>
                        <input placeholder="MM/AA" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      </div>
                      <div>
                        <label style={lbl}>CVV</label>
                        <input placeholder="123" style={inp()} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Nome no Cartão</label>
                      <input placeholder="MARIA A SILVA" style={{ ...inp(), textTransform: 'uppercase' }} onFocus={(e) => (e.target.style.borderColor = '#2a7030')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    {paymentMethod === 'CREDIT_CARD' && (
                      <div>
                        <label style={lbl}>Parcelas</label>
                        <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} style={{ ...inp(), cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                            <option key={n} value={n}>{n}x de {formatCurrency(total / n)}{n > 1 ? ' sem juros' : ''}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ padding: '13px 24px', background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ flex: 1, padding: '14px', background: loading ? '#9ca3af' : '#1e5522', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading
                    ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Processando...</>
                    : <><Lock style={{ width: 18, height: 18 }} /> Confirmar Pedido · {formatCurrency(total)}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══ RESUMO DO PEDIDO ══ */}
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 18, color: '#111', margin: '0 0 18px' }}>
              Resumo do Pedido
            </h3>

            {/* Itens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18, maxHeight: 240, overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                    {item.image && <Image src={item.image} alt={item.name} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Qtd: {item.quantity}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', flexShrink: 0 }}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Cupom */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCouponCode())}
                  style={{ ...inp(), flex: 1, padding: '10px 12px', fontSize: 13 }}
                  onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  onClick={applyCouponCode}
                  disabled={couponLoading}
                  style={{ padding: '10px 12px', background: '#1e5522', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >
                  <Tag style={{ width: 16, height: 16 }} />
                </button>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px' }}>
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>✅ {coupon.code}</span>
                  <button onClick={removeCoupon} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remover</button>
                </div>
              )}
            </div>

            {/* Totais */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                  <span>Desconto</span><span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                <span>Frete</span>
                <span style={{ color: shippingCost === 0 ? '#16a34a' : undefined, fontWeight: shippingCost === 0 ? 600 : 400 }}>
                  {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
                </span>
              </div>
              {freteKm !== null && deliveryType === 'DELIVERY' && (
                <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
                  {freteKm} km da loja
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#1e5522', borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 4 }}>
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: '10px', background: '#f9fafb', borderRadius: 10, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              🔒 Compra 100% segura e protegida
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea { font-family: inherit; }
      `}</style>
    </div>
  )
}
