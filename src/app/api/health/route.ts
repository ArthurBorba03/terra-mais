import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint chamado automaticamente para manter o banco acordado
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}