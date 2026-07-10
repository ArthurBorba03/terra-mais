import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso da Terra Mais – regras e condições para uso do site e compras.',
}

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="section-title mb-2">Termos de Uso</h1>
      <p className="text-gray-400 text-sm mb-10">Última atualização: janeiro de 2025</p>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        {[
          {
            title: '1. Aceitação dos Termos',
            content: 'Ao acessar e usar este site, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.',
          },
          {
            title: '2. Produtos e Disponibilidade',
            content: 'Trabalhamos com produtos perecíveis (flores e plantas). A disponibilidade pode variar diariamente. Reservamos o direito de substituir itens equivalentes em caso de indisponibilidade, com comunicação prévia.',
          },
          {
            title: '3. Preços e Pagamentos',
            content: 'Os preços são em reais (BRL) e incluem impostos. Aceitamos PIX, cartão de crédito e débito. O pedido é confirmado após aprovação do pagamento.',
          },
          {
            title: '4. Entrega',
            content: 'Entregamos na área de cobertura especificada. Pedidos realizados até 14h são entregues no mesmo dia. Para datas especiais, recomendamos pedidos com antecedência.',
          },
          {
            title: '5. Política de Trocas e Devoluções',
            content: 'Por serem produtos perecíveis, aceitamos reclamações em até 24h após a entrega mediante comprovação fotográfica. Problemas com qualidade serão resolvidos com substituição ou reembolso.',
          },
          {
            title: '6. Propriedade Intelectual',
            content: 'Todo o conteúdo deste site (textos, imagens, logo) é de propriedade da Terra Mais ou licenciado para uso. Reprodução não autorizada é proibida.',
          },
          {
            title: '7. Limitação de Responsabilidade',
            content: 'A Terra Mais não se responsabiliza por atrasos causados por eventos extraordinários (catástrofes, greves, etc.) ou por informações incorretas fornecidas pelo cliente.',
          },
          {
            title: '8. Foro',
            content: 'Para dirimir controvérsias, fica eleito o foro da Comarca de Gravataí – RS, com renúncia a qualquer outro, por mais privilegiado que seja.',
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
