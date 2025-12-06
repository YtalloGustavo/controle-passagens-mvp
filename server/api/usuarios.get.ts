import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const usuarios = await prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            setor: true
        },
        orderBy: {
            nome: 'asc'
        }
    })

    // Mapeia para o formato esperado pelo frontend (se necessário)
    return usuarios.map(u => ({
        ...u,
        cargo: u.perfil // Mapeando perfil para cargo conforme solicitado
    }))
})
