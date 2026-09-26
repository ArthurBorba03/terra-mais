'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import { ArrowLeft, Loader2, Save, Tag, TrendingDown, DollarSign, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Category } from '@/types'
import ImageUpload from '@/components/ui/ImageUpload'
import { cn } from '@/lib/utils'

export default function ProductFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew  = params.id === 'new'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(false)
  const [fetching,   setFetching]   = useState(!isNew)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive:     true,
      isFeatured:   false,
      isBestseller: false,
      isNew:        false,
      isPromotion:  false,
      allowExtras:  false,
      tags:         [],
      images:       [],
      stock:        0,
    },
  })

  const images      = watch('images') || []
  const name        = watch('name')
  const isPromotion = watch('isPromotion')
  const price       = watch('price')
  const comparePrice= watch('comparePrice')

  // Calcular desconto
  const desconto = comparePrice && price && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null

  // Carregar categorias
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
  }, [])

  // Carregar produto para edição
  useEffect(() => {
    if (!isNew) {
      fetch(`/api/products/${params.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const p = d.data
            const campos: (keyof ProductInput)[] = [
              'categoryId', 'name', 'slug', 'description', 'shortDesc',
              'isActive', 'isFeatured', 'isBestseller', 'isNew',
              'isPromotion', 'allowExtras', 'images', 'tags',
            ]
            campos.forEach((k) => setValue(k, p[k]))
            setValue('price', Number(p.price))
            setValue('stock', Number(p.stock))
            if (p.comparePrice) setValue('comparePrice', Number(p.comparePrice))
            if (p.costPrice)    setValue('costPrice',    Number(p.costPrice))
          }
        })
        .finally(() => setFetching(false))
    }
  }, [isNew, params.id, setValue])

  // Gerar slug automaticamente
  useEffect(() => {
    if (isNew && name) setValue('slug', slugify(name))
  }, [name, isNew, setValue])

  const onSubmit = async (data: ProductInput) => {
    setLoading(true)
    try {
      const url    = isNew ? '/api/products' : `/api/products/${params.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Erro ao salvar')

      toast.success(isNew ? 'Produto criado com sucesso!' : 'Produto atualizado!')
      router.push('/admin/produtos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#2a7030', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }
  const labelStyle = { display: 'block' as const, fontSize: '13px', fontWeight: 500 as const, color: '#374151', marginBottom: '6px' }
  const errorStyle = { color: '#dc2626', fontSize: '12px', marginTop: '4px' }
  const cardStyle  = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '16px' }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ padding: '8px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111', margin: 0 }}>
            {isNew ? 'Novo Produto' : 'Editar Produto'}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
            Preencha as informações do produto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>

          {/* ── Coluna principal ── */}
          <div>
            {/* Informações básicas */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
                Informações Básicas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input {...register('name')} placeholder="Ex: Buquê de Rosas Vermelhas" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')} />
                  {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL) *</label>
                  <input {...register('slug')} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px' }}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')} />
                  {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Descrição Curta</label>
                  <input {...register('shortDesc')} placeholder="Aparece no card do produto" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <div>
                  <label style={labelStyle}>Descrição Completa *</label>
                  <textarea {...register('description')} rows={5} placeholder="Descreva o produto em detalhes..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')} />
                  {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
                Fotos do Produto
              </h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>
                A primeira foto será a imagem principal
              </p>
              <ImageUpload
                images={images}
                onChange={(newImages) => setValue('images', newImages)}
              />
            </div>
          </div>

          {/* ── Coluna lateral ── */}
          <div>
            {/* Categoria */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
                Categoria e Estoque
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select {...register('categoryId')} style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}>
                    <option value="">Selecionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p style={errorStyle}>{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Estoque *</label>
                  <input {...register('stock', { valueAsNumber: true })} type="number" min="0" placeholder="0"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                    onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
              </div>
            </div>

            {/* Preços */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
                Preços
              </h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px' }}>
                {isPromotion
                  ? 'Produto em promoção — preencha todos os campos'
                  : 'Defina o preço de venda do produto'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Preço principal — muda o label conforme promoção */}
                <div>
                  <label style={labelStyle}>
                    {isPromotion ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingDown style={{ width: 14, height: 14, color: '#16a34a' }} />
                        Preço da Promoção *
                      </span>
                    ) : 'Preço de Venda *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>R$</span>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number" step="0.01" min="0" placeholder="0,00"
                      style={{ ...inputStyle, paddingLeft: '36px', borderColor: isPromotion ? '#16a34a' : '#e5e7eb' }}
                      onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                      onBlur={(e)  => (e.target.style.borderColor = isPromotion ? '#16a34a' : '#e5e7eb')}
                    />
                  </div>
                  {errors.price && <p style={errorStyle}>{errors.price.message}</p>}
                  {isPromotion && (
                    <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: 500 }}>
                      ↑ Este é o preço que o cliente vai pagar
                    </p>
                  )}
                </div>

                {/* Campos extras quando é promoção */}
                {isPromotion && (
                  <>
                    {/* Divider */}
                    <div style={{ borderTop: '1px dashed #e5e7eb', margin: '4px 0' }} />

                    {/* Preço original de venda */}
                    <div>
                      <label style={labelStyle}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Tag style={{ width: 14, height: 14, color: '#dc2626' }} />
                          Preço Original de Venda *
                        </span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>R$</span>
                        <input
                          {...register('comparePrice', { valueAsNumber: true })}
                          type="number" step="0.01" min="0" placeholder="0,00"
                          style={{ ...inputStyle, paddingLeft: '36px' }}
                          onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                          onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
                        />
                      </div>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        Aparece tachado ao lado do preço promocional
                      </p>
                    </div>

                    {/* Custo do produto */}
                    <div>
                      <label style={labelStyle}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <DollarSign style={{ width: 14, height: 14, color: '#7c3aed' }} />
                          Custo do Produto
                        </span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>R$</span>
                        <input
                          {...register('costPrice', { valueAsNumber: true })}
                          type="number" step="0.01" min="0" placeholder="0,00"
                          style={{ ...inputStyle, paddingLeft: '36px', borderColor: '#e9d5ff' }}
                          onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                          onBlur={(e)  => (e.target.style.borderColor = '#e9d5ff')}
                        />
                      </div>
                      <p style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info style={{ width: 11, height: 11 }} />
                        Visível apenas no painel admin
                      </p>
                    </div>

                    {/* Card de resumo do desconto */}
                    {desconto !== null && desconto > 0 && (
                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        border: '1.5px solid #86efac',
                        borderRadius: '12px',
                        padding: '12px 14px',
                      }}>
                        <p style={{ fontSize: '12px', color: '#166534', fontWeight: 600, margin: '0 0 4px' }}>
                          🏷️ Resumo da Promoção
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#15803d' }}>
                          <span>Desconto aplicado:</span>
                          <strong>{desconto}% OFF</strong>
                        </div>
                        {comparePrice && price && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                            <span>Economia do cliente:</span>
                            <strong>R$ {(comparePrice - price).toFixed(2).replace('.', ',')}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Quando não é promoção, mostrar o campo de preço comparativo simples */}
                {!isPromotion && (
                  <div>
                    <label style={labelStyle}>Preço Original (tachado)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>R$</span>
                      <input
                        {...register('comparePrice', { valueAsNumber: true })}
                        type="number" step="0.01" min="0" placeholder="0,00"
                        style={{ ...inputStyle, paddingLeft: '36px' }}
                        onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                        onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Opcional — aparece tachado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Opções */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
                Opções
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'isActive',     label: '✅ Produto ativo' },
                  { key: 'isFeatured',   label: '⭐ Em destaque' },
                  { key: 'isBestseller', label: '🔥 Mais vendido' },
                  { key: 'isNew',        label: '✨ Novidade' },
                  { key: 'isPromotion',  label: '🏷️ Promoção' },
                  { key: 'allowExtras',  label: '🎁 Permite extras' },
                ].map((f) => (
                  <label
                    key={f.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', fontSize: '14px', color: '#374151',
                      padding: f.key === 'isPromotion' ? '8px 12px' : '0',
                      borderRadius: f.key === 'isPromotion' ? '10px' : '0',
                      background: f.key === 'isPromotion' && isPromotion ? '#fef9c3' : 'transparent',
                      border: f.key === 'isPromotion' ? '1.5px solid' : 'none',
                      borderColor: f.key === 'isPromotion' ? (isPromotion ? '#fbbf24' : '#e5e7eb') : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      {...register(f.key as keyof ProductInput)}
                      type="checkbox"
                      style={{ width: '16px', height: '16px', accentColor: '#1e5522', cursor: 'pointer' }}
                    />
                    {f.label}
                    {f.key === 'isPromotion' && isPromotion && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
                        Campos ativados ↑
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {isPromotion && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '12px', color: '#92400e' }}>
                  💡 Com a promoção ativa, preencha os campos de preço na seção acima para que o desconto apareça corretamente na loja.
                </div>
              )}
            </div>

            {/* Botão salvar */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#9ca3af' : '#1e5522',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading
                ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Salvando...</>
                : <><Save style={{ width: 18, height: 18 }} /> {isNew ? 'Criar Produto' : 'Salvar Alterações'}</>
              }
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea { font-family: inherit; }
        input:focus, select:focus, textarea:focus { border-color: #2a7030 !important; }
      `}</style>
    </div>
  )
}
