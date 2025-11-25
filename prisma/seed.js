// prisma/seed.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Começando a semear o banco de dados...')

    // Criar Gestor de Unidade (TI)
    await prisma.usuario.upsert({
        where: { email: 'gestor@ti.com' },
        update: {},
        create: {
            email: 'gestor@ti.com',
            senha: '123',
            nome: 'Carlos Gestor',
            perfil: 'GESTOR',
            setor: 'TI'
        }
    })

    // Criar Gerente de Passagens
    await prisma.usuario.upsert({
        where: { email: 'passagem@voo.com' },
        update: {},
        create: {
            email: 'passagem@voo.com',
            senha: '123',
            nome: 'Ana Passagens',
            perfil: 'PASSAGEM'
        }
    })

    // Criar Admin
    await prisma.usuario.upsert({
        where: { email: 'admin@sistema.com' },
        update: {},
        create: {
            email: 'admin@sistema.com',
            senha: '123',
            nome: 'Administrador',
            perfil: 'ADMIN'
        }
    })

    console.log('✅ Usuários criados! (Gestor, Passagem, Admin)')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })