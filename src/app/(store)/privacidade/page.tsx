import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Terra Mais – como coletamos, usamos e protegemos seus dados.',
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="section-title mb-2">Política de Privacidade</h1>
      <p className="text-gray-400 text-sm mb-10">Última atualização: janeiro de 2025</p>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        {[
          {
            title: '1. Quem Somos',
            content: 'A Terra Mais Floricultura (CNPJ: 59.197.259/0001-17), com sede na Avenida Marechal Rondon, 3742 – Vila Fátima, Cachoeirinha – RS, é a controladora dos dados pessoais coletados neste site.',
          },
          {
            title: '2. Dados que Coletamos',
            content: 'Coletamos nome completo, e-mail, telefone, CPF e endereço de entrega para processar pedidos. Também coletamos dados de navegação (cookies) para melhorar sua experiência.',
          },
          {
            title: '3. Como Usamos seus Dados',
            content: 'Utilizamos seus dados para: (a) processar e entregar pedidos; (b) enviar confirmações e atualizações; (c) melhorar nossos serviços; (d) cumprir obrigações legais.',
          },
          {
            title: '4. Compartilhamento de Dados',
            content: 'Não vendemos seus dados. Compartilhamos apenas com: parceiros de entrega, processadores de pagamento (Mercado Pago/Stripe) e quando exigido por lei.',
          },
          {
            title: '5. Cookies',
            content: 'Usamos cookies essenciais para funcionamento do site e cookies analíticos (com seu consentimento) para entender como você usa nossa loja.',
          },
          {
            title: '6. Seus Direitos (LGPD)',
            content: 'Você tem direito a: confirmar o tratamento, acessar seus dados, corrigir dados incompletos, solicitar exclusão, revogar consentimento e portabilidade. Entre em contato: floriculturaterramais@gmail.com',
          },
          {
            title: '7. Segurança',
            content: 'Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL, controle de acesso e armazenamento seguro.',
          },
          {
            title: '8. Retenção de Dados',
            content: 'Mantemos seus dados pelo período necessário para cumprir as finalidades descritas ou conforme exigido por lei (ex: dados fiscais por 5 anos).',
          },
          {
            title: '9. Contato',
            content: 'Para exercer seus direitos ou esclarecer dúvidas: floriculturaterramais@gmail.com ou (51) 9 9233-2327.',
          },
        ].map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-lg font-bold text-gray-800 mb-2">{s.title}</h2>
            <p className="leading-relaxed">{s.content}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
