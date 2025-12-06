import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function migratePasswords() {
    console.log('--- INICIANDO MIGRAÇÃO DE SENHAS ---')

    const usuarios = await prisma.usuario.findMany()
    console.log(`Encontrados ${usuarios.length} usuários.`)

    let atualizados = 0

    for (const usuario of usuarios) {
        // Verifica se já é hash (bcrypt começa com $2a$, $2b$, $2y$)
        if (usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$') || usuario.senha.startsWith('$2y$')) {
            console.log(`Usuário ${usuario.email} já possui senha criptografada. Pulando.`)
            continue
        }

        console.log(`Criptografando senha do usuário ${usuario.email}...`)
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(usuario.senha, salt)

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { senha: hash }
        })
        atualizados++
    }

    console.log(`--- MIGRAÇÃO CONCLUÍDA ---`)
    console.log(`Usuários atualizados: ${atualizados}`)
}

migratePasswords()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
