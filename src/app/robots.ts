import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://terramais.com.br'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/pedido-confirmado'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
