import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STORE_URL || 'https://terramais.com.br'),
  title: {
    default: 'Terra Mais – Flores, Plantas e Jardins',
    template: '%s | Terra Mais',
  },
  description:
    'Floricultura Terra Mais: flores frescas, plantas, buquês, vasos, adubos e muito mais. Entrega no mesmo dia em Gravataí e região.',
  keywords: ['floricultura', 'flores', 'plantas', 'buquês', 'rosas', 'vasos', 'jardinagem', 'Gravataí', 'Rio Grande do Sul'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Terra Mais',
    title: 'Terra Mais – Flores, Plantas e Jardins',
    description: 'Floricultura com flores frescas, plantas, buquês e muito mais. Entrega no mesmo dia.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Terra Mais Floricultura' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terra Mais – Flores, Plantas e Jardins',
    description: 'Floricultura com flores frescas, plantas, buquês e muito mais.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e5522', color: '#fff', borderRadius: '12px', fontFamily: 'var(--font-inter)' },
            success: { iconTheme: { primary: '#5caa5c', secondary: '#fff' } },
            error: { style: { background: '#dc2626' } },
          }}
        />
      </body>
    </html>
  )
}
