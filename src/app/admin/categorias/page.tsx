'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Loader2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ id: '', name: '', slug: '', icon: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({ id: '', name: '', slug: '', icon: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setForm({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon || '', description: cat.description || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = form.id ? `/api/categories/${form.id}` : '/api/categories'
      const method = form.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, slug: form.slug || slugify(form.name), icon: form.icon, description: form.description, isActive: true }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success(form.id ? 'Categoria atualizada!' : 'Categoria criada!')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-gray-500 text-sm">{categories.length} categorias</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">{form.id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input-field" placeholder="Ex: Flores" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field font-mono text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Emoji / Ícone</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" placeholder="🌸" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Descrição da categoria" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Ícone', 'Nome', 'Slug', 'Produtos', 'Ações'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-2xl">{cat.icon}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-5 py-4 text-gray-500">{cat._count?.products || 0} produtos</td>
                  <td className="px-5 py-4">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
