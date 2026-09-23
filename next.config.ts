import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cache de imagens externas
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 dias de cache para imagens
  },

  // Headers de cache para arquivos estáticos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-XSS-Protection',       value: '1; mode=block' },
        ],
      },
      {
        // Cache longo para assets estáticos
        source: '/(.*)\\.(ico|png|svg|jpg|jpeg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Compressão e otimizações
  compress: true,
  poweredByHeader: false,

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || 'https://floriculturaterramais.com.br',
  },
}

export default nextConfig