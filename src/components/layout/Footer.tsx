import Link from 'next/link'
import { Leaf, Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Mail, Heart } from 'lucide-react'

const categories = [
  { name: 'Flores', href: '/catalogo?categoria=flores' },
  { name: 'Buquês', href: '/catalogo?categoria=buques' },
  { name: 'Rosas', href: '/catalogo?categoria=rosas' },
  { name: 'Plantas', href: '/catalogo?categoria=plantas' },
  { name: 'Vasos', href: '/catalogo?categoria=vasos' },
  { name: 'Jardinagem', href: '/catalogo?categoria=jardinagem' },
  { name: 'Adubos', href: '/catalogo?categoria=adubos' },
  { name: 'Cestas', href: '/catalogo?categoria=cestas' },
]

const links = [
  { name: 'Sobre Nós', href: '/sobre' },
  { name: 'Promoções', href: '/catalogo?promocao=true' },
  { name: 'Mais Vendidos', href: '/catalogo?maisVendidos=true' },
  { name: 'Novidades', href: '/catalogo?novidades=true' },
  { name: 'Contato', href: '/contato' },
  { name: 'Política de Privacidade', href: '/privacidade' },
  { name: 'Termos de Uso', href: '/termos' },
]

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '5551992332327'
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || 'floriculturaterramais'

  return (
    <footer className="bg-brand-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-leaf-400 to-brand-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-white">Terra Mais</div>
                <div className="text-xs text-leaf-300 tracking-wide">Floricultura</div>
              </div>
            </Link>
            <p className="text-brand-200 text-sm leading-relaxed mb-6">
              Cultivando momentos especiais e conectando pessoas através da beleza única e do carinho que só as flores e plantas conseguem transmitir.
            </p>
            <div className="flex gap-3">
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brand-700 hover:bg-leaf-500 rounded-xl flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/terramais"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brand-700 hover:bg-leaf-500 rounded-xl flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brand-700 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-5">Categorias</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="text-brand-200 hover:text-leaf-300 text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-5">Links Úteis</h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-200 hover:text-leaf-300 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-5">Contato</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-brand-200">
                <MapPin className="w-4 h-4 text-leaf-400 flex-shrink-0 mt-0.5" />
                <span>Avenida Marechal Rondon, 3742 – Vila Fátima<br />Cachoerinha – RS, 94965-000</span>
              </li>
              <li className="flex gap-3 text-sm text-brand-200">
                <Phone className="w-4 h-4 text-leaf-400 flex-shrink-0 mt-0.5" />
                <a href="tel:+5551992332327" className="hover:text-leaf-300 transition-colors">
                  (51) 9 9233-2327
                </a>
              </li>
              <li className="flex gap-3 text-sm text-brand-200">
                <Mail className="w-4 h-4 text-leaf-400 flex-shrink-0 mt-0.5" />
                <a href="mailto:floriculturaterramais@gmail.com" className="hover:text-leaf-300 transition-colors">
                  floriculturaterramais@gmail.com
                </a>
              </li>
              <li className="flex gap-3 text-sm text-brand-200">
                <Clock className="w-4 h-4 text-leaf-400 flex-shrink-0 mt-0.5" />
                <span>
                  Seg–Sáb: 9h às 18h<br />
                  Dom: Fechados
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* LGPD / Bottom bar */}
      <div className="border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-brand-400 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Terra Mais Floricultura. Todos os direitos reservados.
          </p>
          <p className="text-brand-400 text-xs flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-400 fill-red-400" /> e muito verde 🌿
          </p>
          <div className="flex gap-4 text-xs text-brand-400">
            <Link href="/privacidade" className="hover:text-brand-200 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-brand-200 transition-colors">Termos</Link>
            <Link href="/lgpd" className="hover:text-brand-200 transition-colors">LGPD</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
