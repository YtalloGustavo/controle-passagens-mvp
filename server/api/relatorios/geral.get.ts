import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // 1. Taxa de Ocupação Global
    const vagas = await prisma.vaga.aggregate({
        _sum: {
            vagasDisponiveis: true,
            vagasOcupadas: true
        }
    })

    const totalDisponivel = vagas._sum.vagasDisponiveis || 0
    const totalOcupado = vagas._sum.vagasOcupadas || 0
    const taxaOcupacao = totalDisponivel > 0 ? Math.round((totalOcupado / totalDisponivel) * 100) : 0

    // 2. Total de Solicitações (Mês Atual)
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const totalSolicitacoes = await prisma.solicitacao.count({
        where: {
            criadoEm: {
                gte: inicioMes,
                lte: fimMes
            }
        }
    })

    // 3. Solicitações por Setor
    const porSetorRaw = await prisma.solicitacao.groupBy({
        by: ['setor'],
        _count: {
            id: true
        }
    })

    const porSetor = porSetorRaw.map(item => ({
        setor: item.setor,
        quantidade: item._count.id
    })).sort((a, b) => b.quantidade - a.quantidade)

    // 4. Solicitações por Status
    const porStatusRaw = await prisma.solicitacao.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    })

    const porStatus = porStatusRaw.map(item => ({
        status: item.status,
        quantidade: item._count.id
    })).sort((a, b) => b.quantidade - a.quantidade)

    // 5. Custo Estimado (Mock: R$ 1.500 por aprovada)
    const aprovadas = await prisma.solicitacao.count({
        where: {
            status: 'APROVADO'
        }
    })
    const custoTotal = aprovadas * 1500

    // 6. Últimas Aprovações Financeiras
    const ultimasAprovacoes = await prisma.historicoAprovacao.findMany({
        where: {
            statusNovo: 'APROVADO'
        },
        take: 5,
        orderBy: {
            data: 'desc'
        },
        include: {
            solicitacao: {
                select: {
                    nomePassageiro: true,
                    setor: true,
                    vaga: {
                        select: {
                            direcao: true,
                            data: true
                        }
                    }
                }
            },
            usuario: {
                select: {
                    nome: true
                }
            }
        }
    })

    return {
        kpis: {
            taxaOcupacao,
            totalSolicitacoes,
            custoTotal,
            passagensEmitidas: aprovadas
        },
        graficos: {
            porSetor,
            porStatus
        },
        tabela: ultimasAprovacoes.map(h => ({
            id: h.id,
            dataAprovacao: h.data,
            passageiro: h.solicitacao.nomePassageiro,
            setor: h.solicitacao.setor,
            destino: h.solicitacao.vaga.direcao === 'IDA' ? 'Noronha' : 'Recife',
            dataVoo: h.solicitacao.vaga.data,
            aprovador: h.usuario.nome
        }))
    }
})
