import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validação Básica
    if (!body.vagaId || !body.nome || !body.cpf || !body.setor) {
        throw createError({ statusCode: 400, statusMessage: 'Dados incompletos.' })
    }

    // 2. Verificar Disponibilidade (IDA)
    const vagaIda = await prisma.vaga.findUnique({
        where: { id: Number(body.vagaId) }
    })

    if (!vagaIda) {
        throw createError({ statusCode: 404, statusMessage: 'Voo de ida não encontrado.' })
    }

    if (vagaIda.bloqueado) {
        throw createError({ statusCode: 400, statusMessage: 'Voo de ida bloqueado pelo Gerente Master para eventos' })
    }

    if ((vagaIda.vagasDisponiveis - vagaIda.vagasOcupadas) <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Voo de ida lotado.' })
    }

    // 3. Verificar Disponibilidade (VOLTA) - Opcional
    let vagaVolta = null
    if (body.vagaVoltaId) {
        vagaVolta = await prisma.vaga.findUnique({
            where: { id: Number(body.vagaVoltaId) }
        })

        if (!vagaVolta) {
            throw createError({ statusCode: 404, statusMessage: 'Voo de volta não encontrado.' })
        }

        if (vagaVolta.bloqueado) {
            throw createError({ statusCode: 400, statusMessage: 'Voo de volta bloqueado pelo Gerente Master para eventos' })
        }

        if ((vagaVolta.vagasDisponiveis - vagaVolta.vagasOcupadas) <= 0) {
            throw createError({ statusCode: 400, statusMessage: 'Voo de volta lotado.' })
        }

        // Validar Cronologia
        if (new Date(vagaVolta.data) < new Date(vagaIda.data)) {
            throw createError({ statusCode: 400, statusMessage: 'A data de volta não pode ser anterior à data de ida.' })
        }
    }

    // 4. Transação no Banco de Dados
    const resultado = await prisma.$transaction(async (tx) => {

        // A. Cria a solicitação
        const novaSolicitacao = await tx.solicitacao.create({
            data: {
                nomePassageiro: body.nome,
                cpfPassageiro: body.cpf,
                dataNascimento: new Date(body.dataNascimento),
                setor: body.setor,
                motivo: body.motivo,
                vagaId: vagaIda.id,
                vagaVoltaId: vagaVolta ? vagaVolta.id : null,
                status: 'ANALISE_GESTOR'
            }
        })

        // B. Desconta a vaga de IDA
        await tx.vaga.update({
            where: { id: vagaIda.id },
            data: {
                vagasOcupadas: { increment: 1 }
            }
        })

        // C. Desconta a vaga de VOLTA (se houver)
        if (vagaVolta) {
            await tx.vaga.update({
                where: { id: vagaVolta.id },
                data: {
                    vagasOcupadas: { increment: 1 }
                }
            })
        }

        // D. Histórico Inicial
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