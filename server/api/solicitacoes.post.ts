import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validação Básica
    if (!body.vagaId || !body.nome || !body.cpf || !body.setor) {
        throw createError({ statusCode: 400, statusMessage: 'Dados incompletos.' })
    }

    // 2. Verificar Disponibilidade
    const vaga = await prisma.vaga.findUnique({
        where: { id: Number(body.vagaId) }
    })

    if (!vaga) {
        throw createError({ statusCode: 404, statusMessage: 'Voo não encontrado.' })
    }

    // Regras de bloqueio
    if (vaga.bloqueado) {
        throw createError({ statusCode: 400, statusMessage: 'Voo bloqueado pelo Gerente Master para eventos' })
    }

    if ((vaga.vagasDisponiveis - vaga.vagasOcupadas) <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Voo lotado.' })
    }

    // 3. Transação no Banco de Dados
    const resultado = await prisma.$transaction(async (tx) => {

        // A. Cria a solicitação
        const novaSolicitacao = await tx.solicitacao.create({
            data: {
                nomePassageiro: body.nome,
                cpfPassageiro: body.cpf,
                dataNascimento: new Date(body.dataNascimento),
                setor: body.setor,
                motivo: body.motivo,
                vagaId: vaga.id,
                status: 'ANALISE_GESTOR'
            }
        })

        // B. Desconta a vaga
        await tx.vaga.update({
            where: { id: vaga.id },
            data: {
                vagasOcupadas: { increment: 1 }
            }
        })

        // C. Histórico Inicial
        await tx.historicoAprovacao.create({
            data: {
                solicitacaoId: novaSolicitacao.id,
                usuarioId: 1, // Temporário (Admin/Gestor)
                statusAnterior: 'N/A',
                statusNovo: 'ANALISE_GESTOR',
                observacao: 'Solicitação criada via sistema.'
            }
        })

        return novaSolicitacao
    })

    return { success: true, id: resultado.id }
})