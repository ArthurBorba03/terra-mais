import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Ana Carolina S.', location: 'Gravataí – RS', rating: 5, text: 'As flores chegaram lindíssimas e super frescas! O buquê de rosas foi um sucesso no aniversário da minha mãe. Com certeza comprarei novamente!', date: 'há 2 dias' },
  { name: 'Roberto M.', location: 'Cachoeirinha – RS', rating: 5, text: 'Entrega pontual e flores de altíssima qualidade. A cesta de presente superou todas as expectativas. Muito obrigado Terra Mais!', date: 'há 1 semana' },
  { name: 'Juliana F.', location: 'Porto Alegre – RS', rating: 5, text: 'Comprei a orquídea para decorar meu apartamento e ela está florescendo há 3 meses! O atendimento pelo WhatsApp foi excelente também.', date: 'há 2 semanas' },
  { name: 'Marcos A.', location: 'Gravataí – RS', rating: 5, text: 'Fiz o pedido de madrugada e as flores chegaram pela manhã para a surpresa do Dia das Mães. Minha mãe ficou emocionada. Nota 10!', date: 'há 3 semanas' },
  { name: 'Fernanda L.', location: 'Alvorada – RS', rating: 5, text: 'O kit de jardinagem que comprei tinha tudo o que precisava e os adubos são de ótima qualidade. Minhas plantas amaram! 🌱', date: 'há 1 mês' },
  { name: 'Paulo R.', location: 'Canoas – RS', rating: 4, text: 'Ótimo custo-benefício e flores muito bonitas. O site é fácil de usar e o pagamento via PIX foi super rápido. Recomendo!', date: 'há 1 mês' },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title">O que dizem nossos clientes</h2>
          <p className="section-subtitle">Mais de 10.000 clientes satisfeitos em todo o Rio Grande do Sul</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-gray-600 font-semibold ml-2">4.9/5 · 2.847 avaliações</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6 hover:-translate-y-1 transition-transform duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-brand-200" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
                <span className="text-xs text-gray-400">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
