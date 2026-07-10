import { Leaf } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Leaf className="w-8 h-8 text-brand-600" />
        </div>
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  )
}
