import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.vagaId || typeof body.bloqueado !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'Dados inválidos. Envie vagaId e bloqueado.' })
    }

    try {
        const vagaAtualizada = await prisma.vaga.update({
            where: { id: Number(body.vagaId) },
            data: { bloqueado: body.bloqueado }
        })

        return { success: true, vaga: vagaAtualizada }
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar bloqueio da vaga.' })
    }
})
