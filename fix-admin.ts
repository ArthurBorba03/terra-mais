/**
 * Script para criar/resetar o usuário admin
 * 
 * Como usar:
 *   npx tsx fix-admin.ts
 * 
 * Este arquivo deve estar na RAIZ do projeto (mesma pasta do package.json)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const EMAIL = 'admin@terramais.com.br'
  const SENHA = 'admin123@TM'

  console.log('\n🔧 Resetando usuário admin...\n')

  // Criar hash da senha
  const hash = await bcrypt.hash(SENHA, 12)
  console.log('✅ Hash da senha gerado')

  // Criar ou atualizar o admin
  const admin = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      password: hash,
      role: 'ADMIN',
      name: 'Administrador Terra Mais',
    },
    create: {
      name: 'Administrador Terra Mais',
      email: EMAIL,
      password: hash,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin salvo no banco com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 E-mail:', admin.email)
  console.log('🔑 Senha: ', SENHA)
  console.log('👑 Role:  ', admin.role)
  console.log('🆔 ID:    ', admin.id)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✔ Agora faça login em /admin/login\n')
}

main()
  .catch((e) => {
    console.error('\n❌ Erro ao criar admin:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())