'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, LayoutDashboard, Package, Tag, ShoppingBag, Users, Ticket, BarChart2, LogOut, Menu, X, ChevronRight, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { label: 'Produtos', href: '/admin/produtos', icon: Package },
  { label: 'Categorias', href: '/admin/categorias', icon: Tag },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Cupons', href: '/admin/cupons', icon: Ticket },
  { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logout realizado!')
    router.push('/admin/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={cn('flex flex-col h-full bg-brand-900', mobile ? 'w-72' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-800">
        <div className="w-9 h-9 bg-gradient-to-br from-leaf-400 to-brand-500 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-lg">Terra Mais</p>
          <p className="text-brand-400 text-xs">Painel Admin</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-brand-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-700 text-white shadow-lg'
                  : 'text-brand-200 hover:bg-brand-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-brand-800">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-200 hover:bg-brand-800 hover:text-white transition-all text-sm font-medium mb-1">
          <span className="w-5 h-5 text-center">🌐</span> Ver Loja
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-brand-200 hover:bg-red-900/50 hover:text-red-300 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-in-left">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-display font-bold text-gray-800 text-lg hidden sm:block">
            {navItems.find((n) => pathname.startsWith(n.href))?.label || 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
