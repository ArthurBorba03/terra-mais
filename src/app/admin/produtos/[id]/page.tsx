'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import { ArrowLeft, Loader2, Save, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

export default function ProductFormPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!isNew)
  const [imageInput, setImageInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true, isFeatured: false, isBestseller: false, isNew: false,
      isPromotion: false, allowExtras: false, tags: [], images: [], stock: 0,
    },
  })

  const images = watch('images') || []
  const name = watch('name')

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.data || []))
  }, [])

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/products/${params.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const p = d.data
            Object.entries(p).forEach(([k, v]) => {
              if (['price', 'comparePrice', 'stock', 'images', 'tags', 'isActive', 'isFeatured', 'isBestseller', 'isNew', 'isPromotion', 'allowExtras', 'categoryId', 'name', 'slug', 'description', 'shortDesc'].includes(k)) {
                setValue(k as keyof ProductInput, v as never)
              }
            })
          }
        })
        .finally(() => setFetching(false))
    }
  }, [isNew, params.id, setValue])

  useEffect(() => {
    if (isNew && name) setValue('slug', slugify(name))
  }, [name, isNew, setValue])

  const addImage = () => {
    if (!imageInput.trim()) return
    setValue('images', [...images, imageInput.trim()])
    setImageInput('')
  }

  const removeImage = (i: number) => {
    setValue('images', images.filter((_, idx) => idx !== i))
  }

  const onSubmit = async (data: ProductInput) => {
    setLoading(true)
    try {
      const url = isNew ? '/api/products' : `/api/products/${params.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Erro ao salvar')
      toast.success(isNew ? 'Produto criado!' : 'Produto atualizado!')
      router.push('/admin/produtos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">{isNew ? 'Novo Produto' : 'Editar Produto'}</h1>
          <p className="text-gray-500 text-sm">Preencha as informações do produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-700">Informações Básicas</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome *</label>
              <input {...register('name')} placeholder="Nome do produto" className="input-field" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Slug (URL) *</label>
              <input {...register('slug')} placeholder="nome-do-produto" className="input-field font-mono text-sm" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição Curta</label>
              <input {...register('shortDesc')} placeholder="Breve descrição (aparece no card)" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição Completa *</label>
              <textarea {...register('description')} rows={5} placeholder="Descrição detalhada do produto..." className="input-field resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Imagens</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                placeholder="https://images.unsplash.com/..."
                className="input-field flex-1 text-sm"
              />
              <button type="button" onClick={addImage} className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.images && <p className="text-red-500 text-xs mb-3">{errors.images.message}</p>}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category + Price */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">Preço e Estoque</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Categoria *</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Selecionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Preço *</label>
              <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0,00" className="input-field" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Preço Original (tachado)</label>
              <input {...register('comparePrice', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0,00" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Estoque *</label>
              <input {...register('stock', { valueAsNumber: true })} type="number" min="0" placeholder="0" className="input-field" />
            </div>
          </div>

          {/* Flags */}
          <div className="card p-6 space-y-3">
            <h2 className="font-semibold text-gray-700 mb-2">Opções</h2>
            {[
              { key: 'isActive', label: '✅ Produto ativo' },
              { key: 'isFeatured', label: '⭐ Em destaque' },
              { key: 'isBestseller', label: '🔥 Mais vendido' },
              { key: 'isNew', label: '✨ Novidade' },
              { key: 'isPromotion', label: '🏷️ Promoção' },
              { key: 'allowExtras', label: '🎁 Permite extras' },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-3 cursor-pointer">
                <input {...register(f.key as keyof ProductInput)} type="checkbox" className="w-4 h-4 accent-brand-600 rounded" />
                <span className="text-sm text-gray-700">{f.label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> {isNew ? 'Criar Produto' : 'Salvar Alterações'}</>}
          </button>
        </div>
      </form>
    </div>
  )
}
