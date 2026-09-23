'use client'

import { useEffect } from 'react'

// Chama o endpoint de health a cada 4 minutos para manter o banco Neon acordado
// (o Neon suspende após 5 minutos de inatividade no plano gratuito)
export default function KeepAlive() {
  useEffect(() => {
    const ping = () => fetch('/api/health').catch(() => {})

    // Pinga imediatamente ao carregar
    ping()

    // Depois pinga a cada 4 minutos
    const interval = setInterval(ping, 4 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return null
}
