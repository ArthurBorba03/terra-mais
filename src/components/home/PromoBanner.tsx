import Link from 'next/link'
import { Tag, ArrowRight } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section className="py-10 bg-gradient-to-r from-brand-700 via-brand-600 to-leaf-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl">Promoções Especiais</h3>
              <p className="text-white/80 text-sm mt-1">Use o cupom <strong className="text-white bg-white/20 px-2 py-0.5 rounded-lg font-mono">TERRAMAIS10</strong> e ganhe 10% de desconto</p>
            </div>
          </div>
          <Link
            href="/catalogo?promocao=true"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Ver Promoções
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
