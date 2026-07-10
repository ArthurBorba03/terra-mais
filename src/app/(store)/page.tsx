import { prisma } from '@/lib/prisma'
import HeroBanner from '@/components/home/HeroBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import ProductSection from '@/components/home/ProductSection'
import BenefitsSection from '@/components/home/BenefitsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import PromoBanner from '@/components/home/PromoBanner'
import type { Product } from '@/types'

function toProduct(p: Record<string, unknown>): Product {
  return {
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  } as unknown as Product
}

async function getHomeData() {
  const [featured, bestsellers, newProducts, promotions, buques, plantas, cestas] =
    await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 8,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isBestseller: true, isActive: true },
        take: 8,
        include: { category: true },
      }),
      prisma.product.findMany({
        where: { isNew: true, isActive: true },
        take: 8,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isPromotion: true, isActive: true },
        take: 8,
        include: { category: true },
      }),
      prisma.product.findMany({
        where: { category: { slug: 'buques' }, isActive: true },
        take: 4,
        include: { category: true },
        orderBy: { isFeatured: 'desc' },
      }),
      prisma.product.findMany({
        where: { category: { slug: 'plantas' }, isActive: true },
        take: 4,
        include: { category: true },
        orderBy: { isBestseller: 'desc' },
      }),
      prisma.product.findMany({
        where: { category: { slug: 'cestas' }, isActive: true },
        take: 4,
        include: { category: true },
      }),
    ])

  return { featured, bestsellers, newProducts, promotions, buques, plantas, cestas }
}

export default async function HomePage() {
  const { featured, bestsellers, newProducts, promotions, buques, plantas, cestas } =
    await getHomeData()

  return (
    <>
      <HeroBanner />
      <CategoryGrid />

      <ProductSection
        title="Produtos em Destaque"
        subtitle="Selecionados especialmente para você"
        products={featured.map(toProduct)}
        viewAllHref="/catalogo?destaque=true"
      />

      <PromoBanner />

      <ProductSection
        title="Buquês Especiais"
        subtitle="Para cada ocasião, um buquê perfeito"
        products={buques.map(toProduct)}
        viewAllHref="/catalogo?categoria=buques"
        viewAllLabel="Ver todos os buquês"
      />

      <ProductSection
        title="🏷️ Promoções"
        subtitle="Ofertas imperdíveis com os melhores preços"
        products={promotions.map(toProduct)}
        viewAllHref="/catalogo?promocao=true"
        viewAllLabel="Ver todas as promoções"
      />

      <BenefitsSection />

      <ProductSection
        title="🔥 Mais Vendidos"
        subtitle="Os preferidos dos nossos clientes"
        products={bestsellers.map(toProduct)}
        viewAllHref="/catalogo?maisVendidos=true"
      />

      <ProductSection
        title="🌿 Plantas & Jardim"
        subtitle="Traga a natureza para dentro de casa"
        products={plantas.map(toProduct)}
        viewAllHref="/catalogo?categoria=plantas"
        viewAllLabel="Ver todas as plantas"
      />

      <ProductSection
        title="🧺 Cestas Especiais"
        subtitle="Presentes completos para quem você ama"
        products={cestas.map(toProduct)}
        viewAllHref="/catalogo?categoria=cestas"
        viewAllLabel="Ver todas as cestas"
      />

      <ProductSection
        title="✨ Novidades"
        subtitle="Os produtos mais recentes da loja"
        products={newProducts.map(toProduct)}
        viewAllHref="/catalogo?novidades=true"
      />

      <TestimonialsSection />
    </>
  )
}
