'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 1,
    title: 'Flores que falam\npor você',
    subtitle: 'Buquês artesanais entregues no mesmo dia com todo carinho que você merece',
    cta: 'Ver Buquês',
    href: '/catalogo?categoria=buques',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    badge: 'Entrega no mesmo dia',
    gradient: 'from-brand-900/80 via-brand-800/60 to-transparent',
  },
  {
    id: 2,
    title: 'Plantas que\ntransformam',
    subtitle: 'Leve natureza e vida para dentro de casa com nossas plantas cuidadosamente selecionadas',
    cta: 'Explorar Plantas',
    href: '/catalogo?categoria=plantas',
    image: 'https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=1400&q=80',
    badge: 'Novidades chegando!',
    gradient: 'from-leaf-900/80 via-leaf-800/50 to-transparent',
  },
  {
    id: 3,
    title: 'Cestas especiais\nque encantam',
    subtitle: 'Presentes únicos com flores, chocolates e muito carinho para momentos inesquecíveis',
    cta: 'Ver Cestas',
    href: '/catalogo?categoria=cestas',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&q=80',
    badge: 'Frete grátis acima de R$200',
    gradient: 'from-earth-900/80 via-earth-800/50 to-transparent',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [next, paused])

  return (
    <section
      className="relative h-[520px] md:h-[620px] lg:h-[680px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
          <div className={cn('absolute inset-0 bg-gradient-to-r', slide.gradient)} />

          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-xl">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-white/30">
                  {slide.badge}
                </span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-white/85 text-lg md:text-xl mb-8 leading-relaxed">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 bg-white text-brand-800 font-semibold px-7 py-3.5 rounded-2xl hover:bg-brand-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors border border-white/30"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors border border-white/30"
        aria-label="Próximo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
