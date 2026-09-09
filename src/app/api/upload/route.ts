import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Verificar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Imagem muito grande (máx 10MB)' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY
    const bucket = process.env.SUPABASE_BUCKET || 'produtos'

    // Se Supabase não configurado, usar ImgBB como fallback
    if (!supabaseUrl || !supabaseKey) {
      return await uploadImgBB(file)
    }

    // Upload para Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
    const arrayBuffer = await file.arrayBuffer()

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'image/webp',
          'x-upsert': 'true',
        },
        body: arrayBuffer,
      }
    )

    if (!uploadRes.ok) {
      // Fallback para ImgBB se Supabase falhar
      return await uploadImgBB(file)
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err) {
    console.error('[UPLOAD ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Erro interno no upload' },
      { status: 500 }
    )
  }
}

// Fallback: ImgBB (quando Supabase não está configurado)
async function uploadImgBB(file: File): Promise<NextResponse> {
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY

  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Nenhum serviço de upload configurado' },
      { status: 500 }
    )
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const form = new FormData()
  form.append('image', base64)
  form.append('key', key)

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form,
  })

  const data = await res.json()

  if (!data.success) {
    return NextResponse.json(
      { success: false, error: 'Erro no ImgBB' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, url: data.data.url })
}
