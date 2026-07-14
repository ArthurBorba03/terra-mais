import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Arthur Gustavo', location: 'Cachoeirinha – RS', rating: 5, text: 'Atendimento excelente, Plantas maravilhosas. Tudo um esétáculo!', date: 'há 4 meses' },
  { name: 'Luisa Rodrigues', location: 'Cachoeirinha – RS', rating: 5, text: 'Atendimento nota 10, Serviço nota 10, Entrega rápida e produtos de qualidade. Buquês são mais lindos ainda pessoalmente. Quando o espaço e o trabalho são feitos com amor, não tem erro, são extremamente abençoados!', date: 'há 1 mês' },
  { name: 'Silvinei Alexon', location: 'Gravataí – RS', rating: 5, text: 'Estou aqui para agradecer pelo trabalho, pelo carinho e pela dedicação que vocês tiveram no pedido que ainda incluiu uma carta que editei ás pressas pelo celular e mandei em PDF pedindo para imprimir. Vocês foram sensacionais.', date: 'há 10 meses' },
  { name: 'Rodrigo Tech', location: 'Gravataí – RS', rating: 5, text: 'Melhor floricultura da região. Preço ótimo e as plantas são lindas e bem cuidadas, e o atendimento é nota 1000', date: 'há 1 ano' },
  { name: 'Luana Dorneles', location: 'Cachoeirinha – RS', rating: 5, text: 'Quero deixar aqui registrado o ótimo atendimento, desde o primeiro contato e até a compra me trataram muito bem, sempre me dando atenção e mandando fotos do que eu pedia. Super indico nota 10.', date: 'há 1 ano' },
  { name: 'Valquiria Soares', location: 'Gravataí – RS', rating: 5, text: 'Atendimento top, super recomendo! Vendedor faz do jeito que o cliente pede, explica sobre o produto, manda fotos dos produtos, tudo com muita atenção e paciência, fizeram a tele corretamente. Minha mãe ficou emocionada! Uma pessoa maravilhosa que gosta do que faz!', date: 'há 1 mês' },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title">O que dizem nossos clientes</h2>
          <p className="section-subtitle">★★★★★ Compromisso com a sua satisfação</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-gray-600 font-semibold ml-2">5/5 ·</span>
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
