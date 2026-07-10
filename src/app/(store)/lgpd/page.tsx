import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Edit, Trash2, Download, Lock, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LGPD – Proteção de Dados',
  description: 'Política de proteção de dados da Terra Mais em conformidade com a LGPD (Lei 13.709/2018).',
}

const rights = [
  { icon: Eye,      title: 'Acesso',        desc: 'Saiba quais dados pessoais temos sobre você.' },
  { icon: Edit,     title: 'Correção',       desc: 'Solicite a correção de dados incompletos ou desatualizados.' },
  { icon: Trash2,   title: 'Exclusão',       desc: 'Peça a eliminação dos seus dados quando não forem mais necessários.' },
  { icon: Download, title: 'Portabilidade',  desc: 'Receba seus dados em formato estruturado e legível.' },
  { icon: Lock,     title: 'Revogação',      desc: 'Retire seu consentimento a qualquer momento.' },
  { icon: Shield,   title: 'Oposição',       desc: 'Oponha-se ao tratamento de dados em certas situações.' },
]

export default function LGPDPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-brand-700" />
        </div>
        <h1 className="section-title mb-3">Proteção de Dados – LGPD</h1>
        <p className="section-subtitle">
          Estamos em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018)
        </p>
      </div>

      {/* Commitment */}
      <div className="card p-7 mb-10 bg-brand-50 border border-brand-100">
        <h2 className="font-display text-xl font-bold text-brand-800 mb-3">Nosso Compromisso</h2>
        <p className="text-brand-700 leading-relaxed">
          A Terra Mais respeita e protege a privacidade de todos os seus clientes. Coletamos apenas os dados necessários para processar seus pedidos e melhorar sua experiência. Nunca vendemos ou compartilhamos seus dados sem autorização legal.
        </p>
      </div>

      {/* Rights grid */}
      <div className="mb-10">
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">Seus Direitos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rights.map((r) => (
            <div key={r.title} className="card p-5 flex gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <r.icon className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact DPO */}
      <div className="card p-7 text-center">
        <Mail className="w-10 h-10 text-brand-600 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-gray-800 mb-2">Encarregado de Dados (DPO)</h2>
        <p className="text-gray-500 text-sm mb-5">
          Para exercer seus direitos ou esclarecer dúvidas sobre proteção de dados, entre em contato com nosso DPO:
        </p>
        <a
          href="mailto:privacidade@terramais.com.br"
          className="btn-primary inline-flex"
        >
          <Mail className="w-4 h-4" />
          privacidade@terramais.com.br
        </a>
        <p className="text-gray-400 text-xs mt-4">
          Tempo de resposta: até 15 dias úteis, conforme previsto na LGPD.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/privacidade" className="text-brand-600 hover:text-brand-700 text-sm font-medium underline">
          Ver Política de Privacidade completa
        </Link>
      </div>
    </div>
  )
}
