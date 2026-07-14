import Image from 'next/image'
import Link from 'next/link'
import { Leaf, Award, Heart, Users, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história da Terra Mais, floricultura com mais de 20 anos levando beleza e natureza para as famílias do RS.',
}

const milestones = [
  { year: '2002', title: 'Fundação', desc: 'A Terra Mais nasce com um pequeno espaço e um grande sonho: levar flores e natureza para cada lar.' },
  { year: '2008', title: 'Expansão', desc: 'Ampliamos nosso espaço físico e passamos a oferecer plantas, adubos e itens de jardinagem.' },
  { year: '2015', title: 'Delivery', desc: 'Lançamos nosso serviço de entrega em domicílio, chegando a mais cidades da região.' },
  { year: '2020', title: 'Loja Online', desc: 'Inauguramos nossa loja virtual para atender clientes 24 horas por dia, 7 dias por semana.' },
  { year: '2024', title: 'Hoje', desc: 'Mai' },
]

const values = [
  { icon: Leaf, title: 'Sustentabilidade', desc: 'Priorizamos fornecedores responsáveis e práticas ecológicas em toda nossa cadeia.', color: 'bg-green-50 text-green-600' },
  { icon: Award, title: 'Qualidade', desc: 'Selecionamos cada flor e planta com rigoroso controle de qualidade para garantir o melhor.', color: 'bg-amber-50 text-amber-600' },
  { icon: Heart, title: 'Carinho', desc: 'Cada arranjo é preparado com amor e atenção aos detalhes, pensando em cada cliente.', color: 'bg-red-50 text-red-600' },
  { icon: Users, title: 'Comunidade', desc: 'Somos parte de Gravataí e nos orgulhamos de contribuir para a beleza e bem-estar local.', color: 'bg-blue-50 text-blue-600' },
]

export default function SobrePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1487530811015-780880f28f1d?w=1400&q=80"
          alt="Terra Mais Floricultura"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 to-brand-700/50" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
              Sobre a Terra Mais
            </h1>
            <p className="text-white/85 text-xl">Mais de 20 anos cultivando beleza e emoções</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title mb-4">Nossa História</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            A Terra Mais nasceu da paixão por flores e pela natureza. Fundada em 2002 na cidade de Gravataí, RS, começamos com um pequeno espaço e um grande sonho: levar beleza, cor e vida para cada lar, celebração e momento especial.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            Ao longo de mais de duas décadas, crescemos e evoluímos, mas nunca deixamos de lado o cuidado artesanal e o atendimento personalizado que são a nossa marca. Hoje, somos uma referência em flores, plantas e jardinagem na região metropolitana de Porto Alegre.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-14">
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-brand-100 hidden md:block" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="card p-5 inline-block text-left max-w-xs">
                    <span className="text-brand-600 font-bold text-sm">{m.year}</span>
                    <h3 className="font-display font-bold text-gray-800 mt-1 mb-1">{m.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-10 h-10 bg-brand-700 rounded-full items-center justify-center flex-shrink-0 z-10 shadow-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Nossos Valores</h2>
            <p className="section-subtitle">O que nos guia em cada flor que entregamos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6 text-center hover:-translate-y-1 transition-transform">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${v.color}`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="section-title mb-4">Venha nos Visitar!</h2>
          <p className="text-gray-500 mb-8">
            Nossa loja fica na Rua das Flores, 123 – Centro, Gravataí – RS. Estamos de portas abertas para receber você!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo" className="btn-primary">
              Ver Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contato" className="btn-secondary">
              Como Chegar
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
