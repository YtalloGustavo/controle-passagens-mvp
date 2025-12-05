import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const usuarioId = Number(query.usuarioId)

    if (!usuarioId) {
        throw createError({ statusCode: 400, statusMessage: 'ID do gestor é obrigatório.' })
    }

    // Busca colaboradores vinculados a este gestor
    const colaboradores = await prisma.colaborador.findMany({
        where: { gestorId: usuarioId },
        orderBy: { nome: 'asc' }
    })

    return colaboradores
})
