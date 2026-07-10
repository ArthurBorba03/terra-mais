'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, Leaf, Phone, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'
import CartDrawer from '@/components/cart/CartDrawer'
import SearchBar from '@/components/layout/SearchBar'

const navLinks = [
  { label: 'Início', href: '/' },
  {
    label: 'Catálogo',
    href: '/catalogo',
    children: [
      { label: 'Flores', href: '/catalogo?categoria=flores' },
      { label: 'Buquês', href: '/catalogo?categoria=buques' },
      { label: 'Rosas', href: '/catalogo?categoria=rosas' },
      { label: 'Plantas', href: '/catalogo?categoria=plantas' },
      { label: 'Vasos', href: '/catalogo?categoria=vasos' },
      { label: 'Jardinagem', href: '/catalogo?categoria=jardinagem' },
      { label: 'Adubos', href: '/catalogo?categoria=adubos' },
      { label: 'Presentes', href: '/catalogo?categoria=presentes' },
      { label: 'Cestas', href: '/catalogo?categoria=cestas' },
    ],
  },
  { label: 'Promoções', href: '/catalogo?promocao=true' },
  { label: 'Contato', href: '/contato' },
]

export default function Header() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const itemCount = getItemCount()

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-brand-700 text-white text-sm py-2 text-center px-4">
        <span className="flex items-center justify-center gap-2 flex-wrap">
          <Phone className="w-3.5 h-3.5" />
          <span>Entrega no mesmo dia para pedidos até 14h &bull; Ligue: (51) 9 9999-9999</span>
        </span>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 bg-white transition-shadow duration-300',
          isScrolled ? 'shadow-md' : 'border-b border-gray-100'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-leaf-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <div className="font-display font-bold text-xl text-brand-800">Terra Mais</div>
                <div className="text-xs text-leaf-600 font-medium tracking-wide">Floricultura</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition-colors">
                      {link.label}
                      <ChevronDown className={cn('w-4 h-4 transition-transform', openDropdown === link.label && 'rotate-180')} />
                    </button>
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 pt-2 w-52 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === link.href
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-700 hover:text-brand-700 hover:bg-brand-50'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button
                className="lg:hidden p-2.5 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-100 pt-4 animate-fade-in">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-4 border-l-2 border-brand-100 ml-3 mb-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-brand-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
