import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Definição do Fluxo de Aprovação
const FLUXO_APROVACAO: Record<string, { proximo: string, perfilNecessario: string }> = {
    // 1. Gestor aprova -> Vai para Passagem
    'ANALISE_GESTOR': { proximo: 'ANALISE_PASSAGEM', perfilNecessario: 'GESTOR' },

    // 2. Passagem aprova -> Vai para Hospedagem
    'ANALISE_PASSAGEM': { proximo: 'ANALISE_HOSPEDAGEM', perfilNecessario: 'PASSAGEM' },

    // 3. Hospedagem aprova -> Vai para Verificação de Volta (Passagem novamente)
    'ANALISE_HOSPEDAGEM': { proximo: 'VERIFICACAO_VOLTA', perfilNecessario: 'HOSPEDAGEM' },

    // 4. Passagem confirma volta -> Vai para Admin
    'VERIFICACAO_VOLTA': { proximo: 'APROVACAO_ADMIN', perfilNecessario: 'PASSAGEM' },

    // 5. Admin aprova -> Vai para Financeiro
    'APROVACAO_ADMIN': { proximo: 'ANALISE_FINANCEIRO', perfilNecessario: 'ADMIN' },

    // 6. Financeiro aprova -> FIM (Aprovado)
    'ANALISE_FINANCEIRO': { proximo: 'APROVADO', perfilNecessario: 'FINANCEIRO' }
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.solicitacaoId || !body.usuarioId || !body.acao) {
        throw createError({ statusCode: 400, statusMessage: 'Dados incompletos.' })
    }

    // 1. Buscar Solicitação e Usuário
    const solicitacao = await prisma.solicitacao.findUnique({ where: { id: body.solicitacaoId } })
    const usuario = await prisma.usuario.findUnique({ where: { id: body.usuarioId } })

    if (!solicitacao) throw createError({ statusCode: 404, statusMessage: `Solicitação ${body.solicitacaoId} não encontrada` })
    if (!usuario) throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })

    // 2. Verificar Permissão
    const etapaAtual = FLUXO_APROVACAO[solicitacao.status]

    // Se não estiver no fluxo (ex: já aprovado ou recusado), erro
    if (!etapaAtual && body.acao === 'APROVAR') {
        throw createError({ statusCode: 400, statusMessage: 'Esta solicitação não está pendente de aprovação.' })
    }

    // Se recusar, qualquer um dos perfis envolvidos pode? Ou só o da etapa?
    // Regra: Só quem está na etapa pode aprovar/recusar
    if (etapaAtual && usuario.perfil !== etapaAtual.perfilNecessario && usuario.perfil !== 'MASTER') {
        throw createError({ statusCode: 403, statusMessage: `Apenas ${etapaAtual.perfilNecessario} pode aprovar nesta etapa.` })
    }

    // 3. Definir Novo Status
    let novoStatus = solicitacao.status
    if (body.acao === 'APROVAR') {
        novoStatus = etapaAtual.proximo
    } else if (body.acao === 'RECUSAR') {
        novoStatus = 'RECUSADO'
    }

    // 4. Atualizar no Banco
    const dadosExtras: any = {}
    if (body.tipoHospedagem) dadosExtras.tipoHospedagem = body.tipoHospedagem
    if (body.infoHospedagem) dadosExtras.infoHospedagem = body.infoHospedagem

    await prisma.$transaction([
        prisma.solicitacao.update({
            where: { id: solicitacao.id },
            data: { status: novoStatus, ...dadosExtras }
        }),
        prisma.historicoAprovacao.create({
            data: {
                solicitacaoId: solicitacao.id,
                usuarioId: usuario.id,
                statusAnterior: solicitacao.status,
                statusNovo: novoStatus,
                observacao: body.observacao || `Ação de ${body.acao}`
            }
        })
    ])

    return { success: true, novoStatus }
})
