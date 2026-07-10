import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="font-display text-6xl font-bold text-brand-800 mb-3">404</h1>
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-3">Página não encontrada</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Essa página voou junto com as pétalas! 🌸<br />
          Mas não se preocupe, temos muito mais para você.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Voltar ao Início</Link>
          <Link href="/catalogo" className="btn-secondary">Ver Catálogo</Link>
        </div>
      </div>
    </div>
  )
}
