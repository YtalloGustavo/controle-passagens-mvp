import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validação básica
    if (!body.id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da solicitação é obrigatório.' })
    }

    // Busca a solicitação para verificar status e permissão
    // Em um cenário real, pegaríamos o usuário da sessão para garantir que ele é o dono
    // Aqui vamos confiar que o frontend manda o ID certo e validar o status
    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: Number(body.id) }
    })

    if (!solicitacao) {
        throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada.' })
    }

    // Regra de Negócio: Só pode editar se estiver em ANALISE_GESTOR
    if (solicitacao.status !== 'ANALISE_GESTOR') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Não é possível editar uma solicitação que já está em análise ou aprovada.'
        })
    }

    try {
        const atualizada = await prisma.solicitacao.update({
            where: { id: Number(body.id) },
            data: {
                nomePassageiro: body.nomePassageiro,
                cpfPassageiro: body.cpfPassageiro,
                dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : undefined,
                motivo: body.motivo
            }
        })

        return { message: 'Solicitação atualizada com sucesso!', solicitacao: atualizada }
    } catch (error) {
        console.error('Erro ao atualizar solicitação:', error)
        throw createError({ statusCode: 500, statusMessage: 'Erro interno ao atualizar solicitação.' })
    }
})
