'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro no login')
      if (data.data.role !== 'ADMIN') throw new Error('Acesso não autorizado')
      toast.success('Bem-vindo ao painel!')
      router.push('/admin/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-leaf-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-leaf-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="w-9 h-9 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Terra Mais</h1>
            <p className="text-gray-500 text-sm mt-1">Painel Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@terramais.com.br"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</> : 'Entrar no Painel'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          © {new Date().getFullYear()} Terra Mais · Área Restrita
        </p>
      </div>
    </div>
  )
}
