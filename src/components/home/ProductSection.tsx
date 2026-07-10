import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types'

interface Props {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref?: string
  viewAllLabel?: string
}

export default function ProductSection({ title, subtitle, products, viewAllHref, viewAllLabel = 'Ver todos' }: Props) {
  if (!products.length) return null

  return (
    <section className="py-14 bg-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:flex items-center gap-1.5 text-brand-700 hover:text-brand-800 font-semibold text-sm transition-colors"
            >
              {viewAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-8 text-center sm:hidden">
            <Link href={viewAllHref} className="btn-secondary text-sm">
              {viewAllLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
