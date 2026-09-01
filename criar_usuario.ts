import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

  // ══════════════════════════════════════
  //   EDITE APENAS ESTAS 4 LINHAS ABAIXO
  // ══════════════════════════════════════
  const NOME  = 'Patricia'
  const EMAIL = 'patty100801@gmail.com'
  const SENHA = '100801'
  const ROLE  = 'ADMIN'   // CUSTOMER = cliente comum | ADMIN = administrador
  // ══════════════════════════════════════

  const hash = await bcrypt.hash(SENHA, 12)

  const user = await prisma.user.upsert({
    where:  { email: EMAIL },
    update: { password: hash, role: ROLE as 'ADMIN' | 'CUSTOMER', name: NOME },
    create: { name: NOME, email: EMAIL, password: hash, role: ROLE as 'ADMIN' | 'CUSTOMER' },
  })

  console.log('\n✅ Usuário criado com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 E-mail:', user.email)
  console.log('🔑 Senha: ', SENHA)
  console.log('👑 Tipo:  ', user.role === 'ADMIN' ? 'Administrador' : 'Cliente')
  console.log('🆔 ID:    ', user.id)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => { console.error('\n❌ Erro ao criar usuário:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())