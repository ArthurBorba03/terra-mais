"use client";
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com a Terra Mais. Estamos em Gravataí – RS. Telefone, WhatsApp, e-mail e mapa.',
}

export default function ContatoPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '5551999999999'
  const message = encodeURIComponent('Olá! Gostaria de falar com a Terra Mais 🌿')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-12">
        <h1 className="section-title mb-3">Fale Conosco</h1>
        <p className="section-subtitle">Estamos sempre prontos para ajudar você!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info column */}
        <div className="space-y-6">
          <div className="card p-7">
            <h2 className="font-display text-xl font-bold text-gray-800 mb-6">Informações de Contato</h2>
            <div className="space-y-5">
              {[
                {
                  icon: MapPin,
                  label: 'Endereço',
                  value: 'Rua das Flores, 123 – Centro\nGravataí – RS, 94000-000',
                  color: 'text-brand-600 bg-brand-50',
                },
                {
                  icon: Phone,
                  label: 'Telefone',
                  value: '(51) 9 9999-9999',
                  href: 'tel:+5551999999999',
                  color: 'text-blue-600 bg-blue-50',
                },
                {
                  icon: Mail,
                  label: 'E-mail',
                  value: 'contato@terramais.com.br',
                  href: 'mailto:contato@terramais.com.br',
                  color: 'text-purple-600 bg-purple-50',
                },
                {
                  icon: Clock,
                  label: 'Horário de Funcionamento',
                  value: 'Segunda a Sábado: 8h às 19h\nDomingo: 9h às 13h',
                  color: 'text-amber-600 bg-amber-50',
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-gray-700 text-sm hover:text-brand-700 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a
              href={`https://wa.me/${whatsapp}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex flex-col items-center gap-3 text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">WhatsApp</p>
                <p className="text-xs text-gray-400 mt-0.5">Resposta rápida</p>
              </div>
            </a>
            <a
              href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM || 'terramais'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex flex-col items-center gap-3 text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                <Instagram className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Instagram</p>
                <p className="text-xs text-gray-400 mt-0.5">@terramais</p>
              </div>
            </a>
          </div>
        </div>

        {/* Map + Form column */}
        <div className="space-y-6">
          <div className="card overflow-hidden" style={{ height: 280 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110695.82099505754!2d-51.10826170000001!3d-29.9442891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95196f01b1ef3809%3A0x48e28af0e84c4ab0!2sGravata%C3%AD%2C%20RS!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Terra Mais no Google Maps"
            />
          </div>

          <div className="card p-7">
            <h3 className="font-display font-bold text-xl text-gray-800 mb-6">Envie uma Mensagem</h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                alert('Mensagem enviada! Entraremos em contato em breve.')
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome *</label>
                  <input type="text" placeholder="Seu nome" className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">E-mail *</label>
                  <input type="email" placeholder="seu@email.com" className="input-field" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Assunto *</label>
                <input type="text" placeholder="Como podemos ajudar?" className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Mensagem *</label>
                <textarea
                  rows={4}
                  placeholder="Descreva sua dúvida ou solicitação..."
                  className="input-field resize-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-400">
                Ao enviar, você concorda com nossa{' '}
                <a href="/privacidade" className="text-brand-600 hover:underline">Política de Privacidade</a>.
              </p>
              <button type="submit" className="btn-primary w-full">Enviar Mensagem</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
