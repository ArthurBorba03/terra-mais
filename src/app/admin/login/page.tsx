'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('admin@terramais.com.br')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setErro(data.error || 'Erro ao fazer login')
        return
      }

      if (data.data.role !== 'ADMIN') {
        setErro('Esta conta não tem acesso ao painel admin')
        return
      }

      const destino = searchParams.get('redirect') || '/admin/dashboard'
      router.push(destino)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e5522 0%, #2a7030 50%, #3a8c3a 100%)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #2a7030, #5caa5c)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Leaf style={{ width: 34, height: 34, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
            Terra Mais
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>
            Painel Administrativo
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#dc2626',
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* E-mail */}
          <div>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#111',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Senha */}
          <div>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}
            >
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 14px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                {showPw
                  ? <EyeOff style={{ width: 18, height: 18 }} />
                  : <Eye style={{ width: 18, height: 18 }} />
                }
              </button>
            </div>
          </div>

          {/* Botão entrar */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || !password ? '#9ca3af' : '#1e5522',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            {loading && (
              <Loader2
                style={{
                  width: 18,
                  height: 18,
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        {/* Dica credenciais */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            fontSize: '13px',
            color: '#166534',
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
         
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1e5522',
          }}
        >
          <Loader2
            style={{
              width: 32,
              height: 32,
              color: '#fff',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
