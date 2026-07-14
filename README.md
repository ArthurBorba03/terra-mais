# 🌿 Terra Mais – E-commerce de Floricultura

> Plataforma completa de e-commerce para a floricultura Terra Mais, desenvolvida com Next.js 15, TypeScript, PostgreSQL e Tailwind CSS.

---

## 📋 Sumário

- [Stack Tecnológica](#stack)
- [Estrutura do Projeto](#estrutura)
- [Pré-requisitos](#pre-requisitos)
- [Instalação Local](#instalacao)
- [Variáveis de Ambiente](#env)
- [Banco de Dados](#banco)
- [Deploy na Vercel](#deploy)
- [Painel Administrativo](#admin)
- [Funcionalidades](#funcionalidades)
- [Integrações](#integracoes)

---

## 🚀 Stack Tecnológica <a name="stack"></a>

| Camada       | Tecnologia                     |
|--------------|-------------------------------|
| Frontend     | Next.js 15 + React + TypeScript |
| Estilização  | Tailwind CSS                   |
| Banco        | PostgreSQL                     |
| ORM          | Prisma                         |
| Auth         | JWT (jose) + bcryptjs          |
| Estado       | Zustand (carrinho)             |
| Formulários  | React Hook Form + Zod          |
| Pagamentos   | Mercado Pago / Stripe          |
| Deploy       | Vercel + Neon/Supabase         |

---

## 📁 Estrutura do Projeto <a name="estrutura"></a>

```
terra-mais/
├── prisma/
│   ├── schema.prisma          # Modelagem do banco
│   └── seed.ts                # 70+ produtos iniciais
├── src/
│   ├── app/
│   │   ├── (store)/           # Rotas públicas da loja
│   │   │   ├── page.tsx       # Home
│   │   │   ├── catalogo/      # Catálogo com filtros
│   │   │   ├── produto/[slug] # Página do produto
│   │   │   ├── checkout/      # Finalização de compra
│   │   │   ├── pedido-confirmado/
│   │   │   ├── contato/
│   │   │   ├── sobre/
│   │   │   ├── privacidade/
│   │   │   ├── termos/
│   │   │   └── lgpd/
│   │   ├── admin/             # Painel administrativo
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── produtos/
│   │   │   ├── categorias/
│   │   │   ├── pedidos/
│   │   │   ├── clientes/
│   │   │   ├── cupons/
│   │   │   └── relatorios/
│   │   └── api/               # API Routes
│   │       ├── products/
│   │       ├── categories/
│   │       ├── orders/
│   │       ├── auth/
│   │       ├── coupons/
│   │       ├── reviews/
│   │       └── admin/
│   ├── components/
│   │   ├── layout/            # Header, Footer, WhatsApp
│   │   ├── home/              # Banner, Seções, Depoimentos
│   │   ├── product/           # ProductCard
│   │   ├── cart/              # CartDrawer
│   │   └── admin/
│   ├── hooks/
│   │   └── useCart.ts         # Zustand cart store
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts            # JWT helpers
│   │   ├── utils.ts
│   │   └── validations.ts     # Zod schemas
│   ├── middleware.ts           # Auth + Security headers
│   ├── styles/globals.css
│   └── types/index.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Pré-requisitos <a name="pre-requisitos"></a>

- **Node.js** 20+
- **PostgreSQL** 15+ (local ou na nuvem)
- **npm** ou **yarn**
- Conta na **Vercel** (para deploy)
- Conta no **Mercado Pago** ou **Stripe** (para pagamentos)

---

## 🛠️ Instalação Local <a name="instalacao"></a>

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/terra-mais.git
cd terra-mais
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

### 4. Configure o banco de dados

```bash
# Gere o cliente Prisma
npm run db:generate

# Execute as migrações
npm run db:migrate

# Popule com dados iniciais (70+ produtos)
npm run db:seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔑 Variáveis de Ambiente <a name="env"></a>

Copie `.env.example` para `.env.local` e preencha:

```env
# Banco de Dados (obrigatório)
DATABASE_URL="postgresql://user:password@localhost:5432/terramais"

# Autenticação (obrigatório - gere com: openssl rand -base64 32)
JWT_SECRET="seu_jwt_secret_aqui"
NEXTAUTH_SECRET="seu_nextauth_secret_aqui"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago (para pagamentos)
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."

# WhatsApp e Redes Sociais
NEXT_PUBLIC_WHATSAPP="5551999999999"
NEXT_PUBLIC_INSTAGRAM="floriculturaterramais"

# URL da loja
NEXT_PUBLIC_STORE_URL="https://terramais.com.br"
```

---

## 🗄️ Banco de Dados <a name="banco"></a>

### Tabelas criadas automaticamente:

| Tabela          | Descrição                    |
|-----------------|------------------------------|
| `users`         | Usuários (admin + clientes)  |
| `customers`     | Dados complementares clientes|
| `addresses`     | Endereços dos clientes       |
| `categories`    | Categorias de produtos       |
| `products`      | Produtos da loja             |
| `orders`        | Pedidos                      |
| `order_items`   | Itens dos pedidos            |
| `payments`      | Pagamentos                   |
| `coupons`       | Cupons de desconto           |
| `reviews`       | Avaliações de produtos       |
| `site_settings` | Configurações da loja        |

### Seed inclui:
- ✅ 20 produtos de flores
- ✅ 10 buquês
- ✅ 8 rosas
- ✅ 20 plantas
- ✅ 10 vasos
- ✅ 10 adubos
- ✅ 10 itens de jardinagem
- ✅ 4 presentes
- ✅ 4 cestas
- ✅ 10 categorias
- ✅ 2 cupons de desconto

---

## 🚀 Deploy na Vercel <a name="deploy"></a>

### 1. Banco de dados na nuvem

Recomendamos **Neon** (gratuito) ou **Supabase**:

```
# Neon: https://neon.tech
# Crie um projeto e copie a DATABASE_URL
DATABASE_URL="postgresql://user:pass@host.neon.tech/terramais?sslmode=require"
```

### 2. Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Ou conecte pelo dashboard: vercel.com/new
```

### 3. Configure as variáveis na Vercel

No dashboard da Vercel:
1. Vá em **Settings → Environment Variables**
2. Adicione todas as variáveis do `.env.example`
3. Faça um novo deploy

### 4. Execute as migrações em produção

```bash
# Via Vercel CLI ou no dashboard
vercel env pull .env.production
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 5. Configure o domínio personalizado

No dashboard Vercel → **Domains** → adicione `terramais.com.br`

---

## 👨‍💼 Painel Administrativo <a name="admin"></a>

Acesse: `https://seudominio.com/admin/login`

**Credenciais padrão após o seed:**
```
E-mail: admin@terramais.com.br
Senha:  admin123@TM
```

> ⚠️ **IMPORTANTE:** Altere a senha imediatamente após o primeiro acesso!

### Funcionalidades do Admin:
- 📊 **Dashboard** – métricas em tempo real
- 📦 **Pedidos** – visualizar, filtrar e atualizar status
- 🌸 **Produtos** – CRUD completo com imagens
- 📁 **Categorias** – gerenciar categorias
- 👥 **Clientes** – histórico de compras
- 🎫 **Cupons** – criar e gerenciar descontos
- 📈 **Relatórios** – faturamento e top produtos

---

## ✨ Funcionalidades <a name="funcionalidades"></a>

### Loja
- [x] Banner rotativo com 3 slides
- [x] Grid de categorias com emojis
- [x] Seções: Destaque, Promoções, Mais Vendidos, Novidades, Cestas, Plantas
- [x] Catálogo com filtros (categoria, preço, flags)
- [x] Busca inteligente em tempo real
- [x] Página de produto com galeria, extras, avaliações e relacionados
- [x] Carrinho persistente (Zustand + localStorage)
- [x] Checkout 3 etapas (dados → entrega → pagamento)
- [x] Agendamento de entrega com horários
- [x] Mensagem personalizada para presente
- [x] Cupons de desconto
- [x] Cálculo de frete
- [x] PIX com QR Code
- [x] Cartão de crédito/débito
- [x] Página de confirmação de pedido
- [x] Depoimentos de clientes
- [x] Benefícios da loja
- [x] WhatsApp flutuante
- [x] Footer completo com links sociais

### SEO & Performance
- [x] Metadata dinâmica por página
- [x] Open Graph para redes sociais
- [x] Sitemap.xml dinâmico
- [x] Robots.txt
- [x] Imagens otimizadas (next/image)
- [x] Fonts otimizadas (next/font)

### Segurança
- [x] JWT httpOnly cookies
- [x] Senhas com bcrypt
- [x] Middleware de autenticação
- [x] Validação Zod em todas as APIs
- [x] Headers de segurança (XSS, CSRF, Clickjacking)
- [x] Proteção de rotas admin

### LGPD
- [x] Política de privacidade completa
- [x] Termos de uso
- [x] Página LGPD com direitos do titular
- [x] DPO configurável

---

## 🔌 Integrações <a name="integracoes"></a>

### WhatsApp
Botão flutuante configurável via `NEXT_PUBLIC_WHATSAPP`:
```
https://wa.me/5551992332327
```

### Instagram
Link no footer via `NEXT_PUBLIC_INSTAGRAM`:
```
https://www.instagram.com/floriculturaterramais/
```

### Google Maps
Incorporado na página de contato. Para personalizar, edite o `src` do `iframe` em `/contato/page.tsx`.

Para usar a API do Maps com marcador personalizado:
```env
NEXT_PUBLIC_GOOGLE_MAPS_KEY="sua_api_key"
```

### Mercado Pago
1. Crie uma conta em mercadopago.com.br
2. Acesse **Credenciais → Produção**
3. Copie o **Access Token** e a **Public Key**
4. Configure em `.env.local`

### Stripe (alternativa)
1. Crie conta em stripe.com
2. Copie **Publishable Key** e **Secret Key**
3. Configure o webhook endpoint: `/api/payments/webhook`

---

## 📱 Responsividade

O layout é totalmente responsivo:
- 📱 **Mobile**: 320px+
- 📟 **Tablet**: 768px+
- 🖥️ **Desktop**: 1024px+

---

## 🎨 Customização

### Cores (tailwind.config.ts)
```ts
brand: {
  700: '#1e5522',  // Verde escuro principal
  600: '#2a7030',  // Verde médio
}
leaf: {
  500: '#5aa843',  // Verde claro
}
earth: {
  500: '#d4853a',  // Tom terra
}
```

### Dados da loja
Edite as configurações em `prisma/seed.ts`:
```ts
{ key: 'whatsapp',        value: '5551992332327' }
{ key: 'phone',           value: '(51) 9 9233-2327' }
{ key: 'address',         value: 'Avenida Marechal Rondon, 3742 - Vila Fátima, Cachoeirinha - RS, 94965-000' }
{ key: 'business_hours',  value: 'Seg-Sáb: 9h às 18h' }
```

---

## 🐛 Solução de Problemas

### Erro de conexão com banco
```bash
# Verifique se o PostgreSQL está rodando
psql -U postgres -c "\l"

# Teste a conexão
npx prisma db pull
```

### Erro de migração
```bash
# Resetar o banco (⚠️ apaga todos os dados)
npx prisma migrate reset

# Re-executar seed
npm run db:seed
```

### Erro de build
```bash
# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules
npm install

# Build limpo
npm run build
```

---

## 📞 Suporte

- **E-mail:** floriculturaterramais@gmail.com
- **WhatsApp:** (51) 9 9233-2327
- **Instagram:** @floriculturaterramais

---

## 📄 Licença

Projeto desenvolvido exclusivamente para a Terra Mais Floricultura.
Todos os direitos reservados © 2025.

---

*Feito com 💚 e muito carinho floral 🌸*
