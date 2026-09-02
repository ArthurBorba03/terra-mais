'use client'

import { useState, useRef } from 'react'
import { Link, ImagePlus, X, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

interface ImageItem {
  url: string          // URL final (ImgBB)
  preview: string      // URL local temporária para preview instantâneo
  status: 'uploading' | 'done' | 'error'
  progress: number
}

export default function ImageUpload({ images, onChange }: Props) {
  const [items, setItems] = useState<ImageItem[]>(
    images.map((url) => ({ url, preview: url, status: 'done', progress: 100 }))
  )
  const [urlInput, setUrlInput] = useState('')
  const [erro, setErro] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Sincronizar com o form quando items muda
  function syncImages(newItems: ImageItem[]) {
    setItems(newItems)
    // Só passa URLs que terminaram o upload
    onChange(newItems.filter((i) => i.status === 'done').map((i) => i.url))
  }

  // Comprime a imagem antes de enviar (reduz até 80% do tamanho)
  function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        // Calcular novo tamanho mantendo proporção
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }

      img.src = url
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const key = process.env.NEXT_PUBLIC_IMGBB_KEY
    if (!key) {
      setErro('Chave ImgBB não configurada')
      return
    }

    setErro('')

    for (const file of files) {
      // 1. Mostrar preview local IMEDIATAMENTE (antes do upload)
      const localPreview = URL.createObjectURL(file)
      const newItem: ImageItem = {
        url: '',
        preview: localPreview,
        status: 'uploading',
        progress: 0,
      }

      // Adicionar o item com status "uploading"
      setItems((prev) => {
        const updated = [...prev, newItem]
        return updated
      })

      try {
        // 2. Comprimir a imagem (mais rápido para enviar)
        const compressed = await compressImage(file)
        const base64 = compressed.split(',')[1]

        // Simular progresso enquanto envia
        setItems((prev) =>
          prev.map((item) =>
            item.preview === localPreview ? { ...item, progress: 30 } : item
          )
        )

        // 3. Enviar para ImgBB
        const form = new FormData()
        form.append('image', base64)
        form.append('key', key)

        setItems((prev) =>
          prev.map((item) =>
            item.preview === localPreview ? { ...item, progress: 60 } : item
          )
        )

        const res = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: form,
        })

        const data = await res.json()

        if (data.success) {
          // 4. Substituir preview local pela URL final
          setItems((prev) => {
            const updated = prev.map((item) =>
              item.preview === localPreview
                ? { url: data.data.url, preview: data.data.url, status: 'done' as const, progress: 100 }
                : item
            )
            onChange(updated.filter((i) => i.status === 'done').map((i) => i.url))
            return updated
          })
          URL.revokeObjectURL(localPreview)
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item.preview === localPreview
                ? { ...item, status: 'error', progress: 0 }
                : item
            )
          )
          setErro('Erro ao enviar imagem. Tente novamente.')
        }
      } catch {
        setItems((prev) =>
          prev.map((item) =>
            item.preview === localPreview
              ? { ...item, status: 'error', progress: 0 }
              : item
          )
        )
        setErro('Erro de conexão. Verifique sua internet.')
      }
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  function handleRemove(index: number) {
    const newItems = items.filter((_, i) => i !== index)
    syncImages(newItems)
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return
    if (!urlInput.startsWith('http')) {
      setErro('URL inválida. Deve começar com http://')
      return
    }
    const newItem: ImageItem = {
      url: urlInput.trim(),
      preview: urlInput.trim(),
      status: 'done',
      progress: 100,
    }
    const newItems = [...items, newItem]
    syncImages(newItems)
    setUrlInput('')
    setErro('')
  }

  return (
    <div>
      {/* Grade de imagens */}
      {items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f3f4f6',
                border: item.status === 'error'
                  ? '2px solid #dc2626'
                  : item.status === 'uploading'
                  ? '2px solid #2a7030'
                  : '2px solid #e5e7eb',
              }}
            >
              {/* Imagem (preview local ou URL final) */}
              <img
                src={item.preview}
                alt={`Foto ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: item.status === 'uploading' ? 0.6 : 1,
                  transition: 'opacity 0.3s',
                }}
              />

              {/* Overlay de upload */}
              {item.status === 'uploading' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <Loader2
                    style={{
                      width: 24,
                      height: 24,
                      color: '#fff',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  {/* Barra de progresso */}
                  <div
                    style={{
                      width: '70%',
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.progress}%`,
                        background: '#fff',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>
                    Enviando...
                  </span>
                </div>
              )}

              {/* Overlay de erro */}
              {item.status === 'error' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(220,38,38,0.7)',
                    fontSize: '11px',
                    color: '#fff',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '4px',
                  }}
                >
                  Erro! Tente novamente
                </div>
              )}

              {/* Ícone de sucesso */}
              {item.status === 'done' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: '#1e5522',
                    borderRadius: '50%',
                    padding: '2px',
                    opacity: 0.9,
                  }}
                >
                  <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
              )}

              {/* Botão remover */}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>

              {/* Badge "Principal" */}
              {i === 0 && item.status === 'done' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    background: '#1e5522',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
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

      {/* Input de arquivo oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Botão escolher do computador */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%',
          padding: '20px',
          border: '2px dashed #bbf7d0',
          borderRadius: '12px',
          background: '#f0fdf4',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#2a7030'
          e.currentTarget.style.background = '#dcfce7'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#bbf7d0'
          e.currentTarget.style.background = '#f0fdf4'
        }}
      >
        <ImagePlus style={{ width: 30, height: 30, color: '#2a7030' }} />
        <span style={{ fontSize: '14px', color: '#2a7030', fontWeight: 600 }}>
          Clique para escolher foto do computador
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          JPG, PNG, WEBP — pode selecionar várias de uma vez
        </span>
      </button>

      {/* Campo URL */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Link
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 15,
              height: 15,
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
              padding: '10px 12px 10px 34px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box' as const,
              color: '#111',
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
            whiteSpace: 'nowrap' as const,
          }}
        >
          Adicionar
        </button>
      </div>

      {/* Erro */}
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
