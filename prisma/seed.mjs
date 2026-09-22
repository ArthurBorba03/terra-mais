// seed.mjs — rode com: node prisma/seed.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🌱 Iniciando seed...\n')

  // ── Categorias ────────────────────────────────────────────
  const categorias = [
    { name: 'Buquês',      slug: 'buques',      icon: '💐', description: 'Buquês frescos e arranjos' },
    { name: 'Rosas',       slug: 'rosas',       icon: '🌹', description: 'Rosas nacionais e importadas' },
    { name: 'Plantas',     slug: 'plantas',     icon: '🪴', description: 'Plantas ornamentais e suculentas' },
    { name: 'Cestas',      slug: 'cestas',      icon: '🧺', description: 'Cestas e kits presenteáveis' },
    { name: 'Arranjos',    slug: 'arranjos',    icon: '🌸', description: 'Arranjos para decoração' },
    { name: 'Jardins',     slug: 'jardins',     icon: '🌿', description: 'Produtos para jardim' },
    { name: 'Adubos',      slug: 'adubos',      icon: '🪣', description: 'Fertilizantes e adubos' },
    { name: 'Presentes',   slug: 'presentes',   icon: '🎁', description: 'Presentes especiais' },
    { name: 'Promoções',   slug: 'promocoes',   icon: '🏷️',  description: 'Ofertas e promoções' },
  ]

  const cats = {}
  for (const cat of categorias) {
    const c = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true, sortOrder: categorias.indexOf(cat) },
    })
    cats[cat.slug] = c
    console.log(`✅ Categoria: ${cat.name}`)
  }

  // ── Produtos ──────────────────────────────────────────────
  const produtos = [
    // Buquês
    {
      categoryId:  cats['buques'].id,
      name:        'Buquê de Rosas Vermelhas',
      slug:        'buque-rosas-vermelhas',
      description: 'Buquê com 12 rosas vermelhas frescas, símbolo do amor e paixão. Embalado com papel kraft e laço de fita.',
      shortDesc:   '12 rosas vermelhas frescas',
      price:       89.90,
      comparePrice:110.00,
      stock:       20,
      images:      ['https://images.unsplash.com/photo-1587530360372-46a8e9e2a5f0?w=600'],
      isActive:    true,
      isFeatured:  true,
      isBestseller:true,
      allowExtras: true,
    },
    {
      categoryId:  cats['buques'].id,
      name:        'Buquê de Lavanda e Eucalipto',
      slug:        'buque-lavanda-eucalipto',
      description: 'Buquê aromático e elegante com lavanda francesa e ramos de eucalipto. Perfumado e sofisticado.',
      shortDesc:   'Lavanda francesa e eucalipto',
      price:       139.90,
      stock:       15,
      images:      ['https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=600'],
      isActive:    true,
      isFeatured:  true,
      allowExtras: true,
    },
    {
      categoryId:  cats['buques'].id,
      name:        'Buquê Misto Colorido',
      slug:        'buque-misto-colorido',
      description: 'Buquê vibrante com mix de flores da estação em diversas cores. Perfeito para aniversários.',
      shortDesc:   'Mix de flores da estação',
      price:       79.90,
      stock:       25,
      images:      ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
      isActive:    true,
      isNew:       true,
      allowExtras: true,
    },
    // Rosas
    {
      categoryId:  cats['rosas'].id,
      name:        'Caixa de Rosas Premium',
      slug:        'caixa-rosas-premium',
      description: 'Caixa luxuosa com 20 rosas importadas. Disponível em diversas cores. Ideal para presentear.',
      shortDesc:   '20 rosas importadas na caixa',
      price:       199.90,
      comparePrice:240.00,
      stock:       10,
      images:      ['https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=600'],
      isActive:    true,
      isFeatured:  true,
      isBestseller:true,
      allowExtras: true,
    },
    {
      categoryId:  cats['rosas'].id,
      name:        'Dúzia de Rosas Brancas',
      slug:        'duzia-rosas-brancas',
      description: '12 rosas brancas frescas, símbolo de pureza e elegância. Embaladas com papel especial.',
      shortDesc:   '12 rosas brancas frescas',
      price:       89.90,
      stock:       18,
      images:      ['https://images.unsplash.com/photo-1495108083478-fc8d6d200a64?w=600'],
      isActive:    true,
      allowExtras: true,
    },
    // Plantas
    {
      categoryId:  cats['plantas'].id,
      name:        'Suculenta no Vaso',
      slug:        'suculenta-vaso',
      description: 'Suculenta variada em vaso de cerâmica. Planta resistente, ideal para ambientes internos.',
      shortDesc:   'Suculenta em vaso de cerâmica',
      price:       34.90,
      stock:       50,
      images:      ['https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600'],
      isActive:    true,
      isNew:       true,
    },
    {
      categoryId:  cats['plantas'].id,
      name:        'Samambaia Pendente',
      slug:        'samambaia-pendente',
      description: 'Samambaia exuberante em vaso pendente. Ideal para varandas e ambientes com luz indireta.',
      shortDesc:   'Samambaia em vaso pendente',
      price:       59.90,
      stock:       30,
      images:      ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
      isActive:    true,
      isFeatured:  true,
    },
    {
      categoryId:  cats['plantas'].id,
      name:        'Orquídea Phalaenopsis',
      slug:        'orquidea-phalaenopsis',
      description: 'Orquídea branca em vaso elegante. Florescimento prolongado de até 3 meses.',
      shortDesc:   'Orquídea branca com florescimento longo',
      price:       89.90,
      comparePrice:110.00,
      stock:       20,
      images:      ['https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600'],
      isActive:    true,
      isFeatured:  true,
      isBestseller:true,
    },
    // Cestas
    {
      categoryId:  cats['cestas'].id,
      name:        'Cesta de Café da Manhã Floral',
      slug:        'cesta-cafe-manha-floral',
      description: 'Cesta com seleção de flores frescas e produtos gourmet: queijos, geleias, vinhos, chocolates e biscoitos artesanais.',
      shortDesc:   'Flores + produtos gourmet',
      price:       169.90,
      comparePrice:200.00,
      stock:       8,
      images:      ['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600'],
      isActive:    true,
      isFeatured:  true,
      isBestseller:true,
      allowExtras: true,
    },
    {
      categoryId:  cats['cestas'].id,
      name:        'Cesta Bebê Flores',
      slug:        'cesta-bebe-flores',
      description: 'Cesta especial para recém-nascidos com flores delicadas e produtos para o bebê.',
      shortDesc:   'Flores e mimos para bebê',
      price:       289.90,
      comparePrice:320.00,
      stock:       5,
      images:      ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600'],
      isActive:    true,
      isFeatured:  true,
      allowExtras: true,
    },
    // Arranjos
    {
      categoryId:  cats['arranjos'].id,
      name:        'Arranjo Mesa Corporativo',
      slug:        'arranjo-mesa-corporativo',
      description: 'Arranjo sofisticado para mesa corporativa ou recepção. Flores de alta durabilidade.',
      shortDesc:   'Arranjo sofisticado para empresa',
      price:       249.90,
      stock:       10,
      images:      ['https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600'],
      isActive:    true,
      isFeatured:  true,
    },
    {
      categoryId:  cats['arranjos'].id,
      name:        'Arranjo de Mesa Rústico',
      slug:        'arranjo-mesa-rustico',
      description: 'Arranjo em vaso rústico com flores silvestres. Perfeito para decoração de eventos.',
      shortDesc:   'Flores silvestres em vaso rústico',
      price:       119.90,
      stock:       15,
      images:      ['https://images.unsplash.com/photo-1487530811015-780780169993?w=600'],
      isActive:    true,
      isNew:       true,
    },
    // Jardins
    {
      categoryId:  cats['jardins'].id,
      name:        'Kit Horta em Casa',
      slug:        'kit-horta-casa',
      description: 'Kit completo para montar sua horta: sementes de ervas, terra adubada e vasos.',
      shortDesc:   'Sementes + terra + vasos',
      price:       79.90,
      stock:       25,
      images:      ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
      isActive:    true,
      isNew:       true,
    },
    // Adubos
    {
      categoryId:  cats['adubos'].id,
      name:        'Adubo Orgânico Premium 1kg',
      slug:        'adubo-organico-premium',
      description: 'Adubo orgânico de alta qualidade para flores e plantas ornamentais. Enriquece o solo.',
      shortDesc:   'Adubo orgânico para flores',
      price:       29.90,
      stock:       100,
      images:      ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
      isActive:    true,
    },
    // Presentes
    {
      categoryId:  cats['presentes'].id,
      name:        'Cesta Dia das Mães Premium',
      slug:        'cesta-dia-maes-premium',
      description: 'Cesta especial para o Dia das Mães com rosas, chocolates belgas e perfume importado.',
      shortDesc:   'Rosas + chocolates + perfume',
      price:       299.90,
      comparePrice:350.00,
      stock:       12,
      images:      ['https://images.unsplash.com/photo-1483736762161-1d107f3c78e1?w=600'],
      isActive:    true,
      isFeatured:  true,
      isBestseller:true,
      allowExtras: true,
    },
    // Promoções
    {
      categoryId:  cats['promocoes'].id,
      name:        'Margarida Branca',
      slug:        'margarida-branca',
      description: 'Buquê de margaridas brancas frescas. Delicadas e perfumadas, ideais para decoração.',
      shortDesc:   'Margaridas brancas frescas',
      price:       7.90,
      comparePrice:45.00,
      stock:       30,
      images:      ['https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=600'],
      isActive:    true,
      isPromotion: true,
      allowExtras: true,
    },
  ]

  for (const produto of produtos) {
    await prisma.product.upsert({
      where:  { slug: produto.slug },
      update: { ...produto },
      create: { ...produto, tags: [] },
    })
    console.log(`✅ Produto: ${produto.name}`)
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log(`📦 ${categorias.length} categorias e ${produtos.length} produtos criados.\n`)
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
