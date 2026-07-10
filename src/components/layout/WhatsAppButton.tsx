'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '5551999999999'
  const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos da Terra Mais 🌿')
  const href = `https://wa.me/${whatsapp}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      aria-label="Falar pelo WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white" />
      <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Falar no WhatsApp
      </span>
    </a>
  )
}
