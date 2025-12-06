import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário é obrigatório.'
        })
    }

    try {
        await prisma.usuario.delete({
            where: { id: Number(body.id) }
        })

        return { message: 'Usuário excluído com sucesso!' }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro interno ao excluir usuário. Verifique se existem registros vinculados.'
        })
    }
})
