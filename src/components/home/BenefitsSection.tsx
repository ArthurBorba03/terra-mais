import { Truck, Clock, ShieldCheck, Heart, Award, Phone } from 'lucide-react'

const benefits = [
  {
    icon: Truck,
    title: 'Entrega Expressa',
    desc: 'Pedidos até 14h entregues no mesmo dia com muito cuidado e pontualidade.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Sempre Frescas',
    desc: 'Trabalhamos com flores colhidas diariamente para garantir máxima durabilidade.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    desc: 'Pagamento protegido com criptografia SSL e diversas formas de pagamento.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Heart,
    title: 'Feito com Amor',
    desc: 'Cada arranjo é preparado artesanalmente por floristas profissionais apaixonados.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Award,
    title: '20 Anos de Tradição',
    desc: 'Mais de duas décadas levando beleza e emoção para milhares de famílias.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Phone,
    title: 'Suporte 24h',
    desc: 'Nossa equipe está sempre disponível via WhatsApp para tirar suas dúvidas.',
    color: 'bg-teal-50 text-teal-600',
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-16 bg-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title">Por que escolher a Terra Mais?</h2>
          <p className="section-subtitle">Comprometidos com qualidade, frescor e satisfação garantida</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="card p-6 flex gap-4 hover:-translate-y-1 transition-transform duration-200">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${benefit.color}`}>
                <benefit.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-800 mb-1">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
