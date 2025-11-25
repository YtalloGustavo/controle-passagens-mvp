import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const usuarios = await prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            perfil: true,
            setor: true
        },
        orderBy: {
            nome: 'asc'
        }
    })

    return usuarios
})
