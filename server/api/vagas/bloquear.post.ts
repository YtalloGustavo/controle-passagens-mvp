import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validação de Entrada
    if (!body.vagaId || typeof body.bloqueado !== 'boolean' || !body.usuarioId) {
        throw createError({ statusCode: 400, statusMessage: 'Dados incompletos. Necessário vagaId, bloqueado (boolean) e usuarioId.' })
    }

    // 2. Verificar Usuário (Apenas MASTER pode bloquear)
    const usuario = await prisma.usuario.findUnique({ where: { id: body.usuarioId } })
    if (!usuario) {
        throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })
    }

    if (usuario.perfil !== 'MASTER' && usuario.perfil !== 'ADMIN') { // Admin também pode por segurança
        throw createError({ statusCode: 403, statusMessage: 'Apenas Gerente Master pode gerenciar bloqueios.' })
    }

    // 3. Atualizar Vaga
    try {
        const vagaAtualizada = await prisma.vaga.update({
            where: { id: body.vagaId },
            data: { bloqueado: body.bloqueado }
        })

        return {
            success: true,
            message: `Vaga ${body.bloqueado ? 'bloqueada' : 'desbloqueada'} com sucesso.`,
            vaga: vagaAtualizada
        }
    } catch (error) {
        console.error('Erro ao bloquear vaga:', error)
        throw createError({ statusCode: 500, statusMessage: 'Erro interno ao atualizar vaga.' })
    }
})
