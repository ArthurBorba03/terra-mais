'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Link, ImagePlus } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUpload({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [erro, setErro] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Upload do computador via ImgBB ─────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const key = process.env.NEXT_PUBLIC_IMGBB_KEY
    if (!key) {
      setErro('Chave ImgBB não configurada no .env.local')
      return
    }

    setUploading(true)
    setErro('')

    for (const file of files) {
      try {
        // Converter para base64
        const base64 = await toBase64(file)

        // Enviar para o ImgBB
        const form = new FormData()
        form.append('image', base64.split(',')[1]) // remove o prefixo data:...
        form.append('key', key)

        const res = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: form,
        })

        const data = await res.json()

        if (data.success) {
          onChange([...images, data.data.url])
        } else {
          setErro('Erro ao fazer upload. Tente novamente.')
        }
      } catch {
        setErro('Erro ao enviar imagem. Verifique sua conexão.')
      }
    }

    setUploading(false)
    // Limpar o input para permitir enviar o mesmo arquivo novamente
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Adicionar por URL ──────────────────────────────────
  function handleAddUrl() {
    if (!urlInput.trim()) return
    if (!urlInput.startsWith('http')) {
      setErro('URL inválida. Deve começar com http:// ou https://')
      return
    }
    onChange([...images, urlInput.trim()])
    setUrlInput('')
    setErro('')
  }

  // ── Remover imagem ─────────────────────────────────────
  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      {/* Prévia das imagens */}
      {images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#f3f4f6',
                border: '1.5px solid #e5e7eb',
              }}
            >
              <img
                src={img}
                alt={`Imagem ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Erro'
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                }}
                title="Remover imagem"
              >
                ✕
              </button>
              {i === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    background: '#1e5522',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão de upload do computador */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          width: '100%',
          padding: '20px',
          border: '2px dashed #d1fae5',
          borderRadius: '12px',
          background: uploading ? '#f9fafb' : '#f0fdf4',
          cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!uploading) (e.currentTarget.style.borderColor = '#2a7030')
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.style.borderColor = '#d1fae5')
        }}
      >
        {uploading ? (
          <>
            <Loader2 style={{ width: 28, height: 28, color: '#2a7030', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: '#2a7030', fontWeight: 500 }}>
              Enviando imagem...
            </span>
          </>
        ) : (
          <>
            <ImagePlus style={{ width: 28, height: 28, color: '#2a7030' }} />
            <span style={{ fontSize: '14px', color: '#2a7030', fontWeight: 600 }}>
              Clique para escolher foto do computador
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              JPG, PNG, WEBP — pode selecionar várias de uma vez
            </span>
          </>
        )}
      </button>

      {/* Campo de URL (opcional) */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Link
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              color: '#9ca3af',
            }}
          />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            placeholder="Ou cole um link de imagem da internet..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#111',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          style={{
            padding: '10px 16px',
            background: '#1e5522',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}
        >
          Adicionar
        </button>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px' }}>
          ⚠️ {erro}
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Converte File para base64
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
