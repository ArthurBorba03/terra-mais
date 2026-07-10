import Link from 'next/link'

const categories = [
  { name: 'Flores', icon: '🌸', href: '/catalogo?categoria=flores', color: 'from-pink-50 to-rose-50', border: 'hover:border-pink-200' },
  { name: 'Buquês', icon: '💐', href: '/catalogo?categoria=buques', color: 'from-purple-50 to-violet-50', border: 'hover:border-purple-200' },
  { name: 'Rosas', icon: '🌹', href: '/catalogo?categoria=rosas', color: 'from-red-50 to-rose-50', border: 'hover:border-red-200' },
  { name: 'Plantas', icon: '🌿', href: '/catalogo?categoria=plantas', color: 'from-green-50 to-emerald-50', border: 'hover:border-green-200' },
  { name: 'Vasos', icon: '🪴', href: '/catalogo?categoria=vasos', color: 'from-amber-50 to-yellow-50', border: 'hover:border-amber-200' },
  { name: 'Jardinagem', icon: '🪚', href: '/catalogo?categoria=jardinagem', color: 'from-lime-50 to-green-50', border: 'hover:border-lime-200' },
  { name: 'Adubos', icon: '🌱', href: '/catalogo?categoria=adubos', color: 'from-brown-50 to-amber-50', border: 'hover:border-amber-300' },
  { name: 'Presentes', icon: '🎁', href: '/catalogo?categoria=presentes', color: 'from-orange-50 to-amber-50', border: 'hover:border-orange-200' },
  { name: 'Cestas', icon: '🧺', href: '/catalogo?categoria=cestas', color: 'from-yellow-50 to-amber-50', border: 'hover:border-yellow-200' },
  { name: 'Promoções', icon: '🏷️', href: '/catalogo?promocao=true', color: 'from-red-50 to-orange-50', border: 'hover:border-red-200' },
]

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <h2 className="section-title">Explore por Categoria</h2>
        <p className="section-subtitle">Encontre exatamente o que você procura</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border border-transparent ${cat.border} transition-all duration-200 hover:shadow-card hover:-translate-y-1 group`}
          >
            <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200">
              {cat.icon}
            </span>
            <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
