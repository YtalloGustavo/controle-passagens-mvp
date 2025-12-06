import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Tenta ler do body (se houver) ou da query string
    let id = null
    console.log('--- DELETE REQUEST RECEIVED ---')
    try {
        const body = await readBody(event)
        console.log('Body:', body)
        id = body?.id
    } catch (e) {
        // Body pode estar vazio em DELETE
    }

    if (!id) {
        const query = getQuery(event)
        console.log('Query:', query)
        id = query.id
    }

    console.log('Resolved ID:', id)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da solicitação é obrigatório.' })
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: Number(id) }
    })

    if (!solicitacao) {
        throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada.' })
    }

    // Regra de Negócio: Exclusão permitida em qualquer etapa (Solicitado pelo usuário)
    // if (solicitacao.status !== 'ANALISE_GESTOR') { ... }

    try {
        // 1. Atualizar Vagas (Liberar espaço)
        // Vaga de Ida
        await prisma.vaga.update({
            where: { id: solicitacao.vagaId },
            data: { vagasOcupadas: { decrement: 1 } }
        })

        // Vaga de Volta (se houver)
        if (solicitacao.vagaVoltaId) {
            await prisma.vaga.update({
                where: { id: solicitacao.vagaVoltaId },
                data: { vagasOcupadas: { decrement: 1 } }
            })
        }

        // 2. Excluir Históricos
        await prisma.historicoAprovacao.deleteMany({
            where: { solicitacaoId: Number(id) }
        })

        // 3. Excluir Solicitação
        await prisma.solicitacao.delete({
            where: { id: Number(id) }
        })

        return { message: 'Solicitação excluída com sucesso!' }
    } catch (error) {
        console.error('Erro ao excluir solicitação:', error)
        throw createError({ statusCode: 500, statusMessage: 'Erro interno ao excluir solicitação.' })
    }
})
