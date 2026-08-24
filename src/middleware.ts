import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Nunca bloquear a página de login nem a API de login
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/coupons/validate')
  ) {
    return NextResponse.next()
  }

  // Proteger páginas /admin/*
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // Proteger APIs /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}