import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.id) {
        throw createError({ statusCode: 400, statusMessage: 'ID do colaborador é obrigatório.' })
    }

    await prisma.colaborador.delete({
        where: { id: body.id }
    })

    return { success: true }
})
