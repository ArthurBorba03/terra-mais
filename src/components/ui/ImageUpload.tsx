'use client'

import { useState, useRef, useCallback } from 'react'
import { ImagePlus, X, Loader2, CheckCircle, Link, AlertCircle } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
}

interface ImageItem {
  id: string
  url: string
  preview: string
  status: 'uploading' | 'done' | 'error'
  progress: number
  errorMsg?: string
}

// Comprime imagem no navegador (sem servidor)
async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', quality)
    }
    img.src = url
  })
}

// Upload via API interna do Next.js
async function uploadImage(
  blob: Blob,
  fileName: string,
  onProgress: (p: number) => void
): Promise<string> {
  onProgress(20)
  const formData = new FormData()
  formData.append('file', blob, fileName)
  onProgress(50)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  onProgress(90)
  const data = await res.json()

  if (!data.success) throw new Error(data.error || 'Erro no upload')
  onProgress(100)
  return data.url
}

export default function ImageUpload({ images, onChange }: Props) {
  const [items, setItems] = useState<ImageItem[]>(() =>
    images.map((url, i) => ({
      id: `existing-${i}`,
      url,
      preview: url,
      status: 'done',
      progress: 100,
    }))
  )
  const [urlInput, setUrlInput] = useState('')
  const [urlErro, setUrlErro] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function syncToForm(newItems: ImageItem[]) {
    onChange(newItems.filter((i) => i.status === 'done').map((i) => i.url))
  }

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return

      const newItems: ImageItem[] = files.map((f) => ({
        id: `upload-${Date.now()}-${Math.random()}`,
        url: '',
        preview: URL.createObjectURL(f),
        status: 'uploading' as const,
        progress: 0,
      }))

      setItems((prev) => {
        const updated = [...prev, ...newItems]
        return updated
      })

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const item = newItems[i]

        try {
          // Comprimir antes de enviar
          const compressed = await compressImage(file)

          const url = await uploadImage(
            compressed,
            `produto-${Date.now()}.webp`,
            (progress) => {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === item.id ? { ...it, progress } : it
                )
              )
            }
          )

          setItems((prev) => {
            const updated = prev.map((it) =>
              it.id === item.id
                ? { ...it, url, status: 'done' as const, progress: 100 }
                : it
            )
            syncToForm(updated)
            URL.revokeObjectURL(item.preview)
            return updated
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erro no upload'
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: 'error' as const, progress: 0, errorMsg: msg }
                : it
            )
          )
        }
      }

      if (fileRef.current) fileRef.current.value = ''
    },
    []
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(Array.from(e.target.files || []))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    processFiles(files)
  }

  function handleRemove(id: string) {
    setItems((prev) => {
      const updated = prev.filter((it) => it.id !== id)
      syncToForm(updated)
      return updated
    })
  }

  function handleRetry(id: string) {
    // Remove o item com erro para tentar de novo
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  function handleAddUrl() {
    setUrlErro('')
    if (!urlInput.trim()) return
    if (!urlInput.startsWith('http')) {
      setUrlErro('URL inválida')
      return
    }
    const newItem: ImageItem = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      preview: urlInput.trim(),
      status: 'done',
      progress: 100,
    }
    setItems((prev) => {
      const updated = [...prev, newItem]
      syncToForm(updated)
      return updated
    })
    setUrlInput('')
  }

  const uploadingCount = items.filter((i) => i.status === 'uploading').length

  return (
    <div>
      {/* Grade de imagens */}
      {items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f3f4f6',
                border:
                  item.status === 'error'
                    ? '2px solid #ef4444'
                    : item.status === 'uploading'
                    ? '2px dashed #2a7030'
                    : '2px solid #e5e7eb',
                transition: 'border-color 0.2s',
              }}
            >
              <img
                src={item.preview}
                alt={`Foto ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: item.status === 'uploading' ? 0.5 : 1,
                  transition: 'opacity 0.3s',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ESem foto%3C/text%3E%3C/svg%3E"
                }}
              />

              {/* Overlay upload */}
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
                    background: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <Loader2
                    style={{
                      width: 22,
                      height: 22,
                      color: '#fff',
                      animation: 'imgup-spin 1s linear infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '65%',
                      height: '3px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.progress}%`,
                        background: '#4ade80',
                        borderRadius: '2px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>
                    {item.progress}%
                  </span>
                </div>
              )}

              {/* Overlay erro */}
              {item.status === 'error' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    background: 'rgba(220,38,38,0.75)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  onClick={() => handleRetry(item.id)}
                  title="Clique para remover e tentar de novo"
                >
                  <AlertCircle style={{ width: 20, height: 20, color: '#fff' }} />
                  <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, textAlign: 'center' }}>
                    Erro — clique para remover
                  </span>
                </div>
              )}

              {/* Check de sucesso */}
              {item.status === 'done' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: '#16a34a',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle style={{ width: 12, height: 12, color: '#fff' }} />
                </div>
              )}

              {/* Botão remover */}
              {item.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#dc2626',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  <X style={{ width: 11, height: 11, color: '#fff' }} />
                </button>
              )}

              {/* Badge principal */}
              {idx === 0 && item.status === 'done' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    background: '#1e5522',
                    color: '#fff',
                    fontSize: '8px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '5px',
                    letterSpacing: '0.5px',
                  }}
                >
                  PRINCIPAL
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Área de drop / clique */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          width: '100%',
          padding: '22px 16px',
          border: `2px dashed ${dragOver ? '#1e5522' : '#bbf7d0'}`,
          borderRadius: '14px',
          background: dragOver ? '#dcfce7' : '#f0fdf4',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        {uploadingCount > 0 ? (
          <>
            <Loader2
              style={{
                width: 28,
                height: 28,
                color: '#2a7030',
                animation: 'imgup-spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: '14px', color: '#2a7030', fontWeight: 600 }}>
              Enviando {uploadingCount} foto{uploadingCount > 1 ? 's' : ''}...
            </span>
          </>
        ) : (
          <>
            <ImagePlus style={{ width: 30, height: 30, color: '#2a7030' }} />
            <span style={{ fontSize: '14px', color: '#2a7030', fontWeight: 600 }}>
              {dragOver
                ? 'Solte as fotos aqui!'
                : 'Clique ou arraste fotos aqui'}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              JPG, PNG, WEBP • Pode selecionar várias de uma vez
            </span>
          </>
        )}
      </div>

      {/* Campo URL */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Link
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              color: '#9ca3af',
            }}
          />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), handleAddUrl())
            }
            placeholder="Ou cole um link de imagem..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 32px',
              border: `1.5px solid ${urlErro ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '10px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box' as const,
              color: '#111',
              background: '#fff',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2a7030')}
            onBlur={(e) =>
              (e.target.style.borderColor = urlErro ? '#ef4444' : '#e5e7eb')
            }
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
      {urlErro && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          {urlErro}
        </p>
      )}

      <style>{`
        @keyframes imgup-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
