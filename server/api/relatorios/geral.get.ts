import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    // Filtros de Data (Opcionais, padrão: mês atual)
    const hoje = new Date()
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString()

    const dataInicio = new Date(String(query.dataInicio || inicioPadrao))
    const dataFim = new Date(String(query.dataFim || fimPadrao))
    // Ajustar fim do dia para dataFim
    dataFim.setHours(23, 59, 59, 999)

    const filtroData = {
        criadoEm: {
            gte: dataInicio,
            lte: dataFim
        }
    }

    // 1. Taxa de Ocupação Global (Não depende de data da solicitação, mas sim das vagas no período?)
    // Para simplificar, mantemos global ou filtramos vagas pela data?
    // O ideal seria filtrar vagas cuja data está no range.
    const vagas = await prisma.vaga.aggregate({
        where: {
            data: {
                gte: dataInicio,
                lte: dataFim
            }
        },
        _sum: {
            vagasDisponiveis: true,
            vagasOcupadas: true
        }
    })

    const totalDisponivel = vagas._sum.vagasDisponiveis || 0
    const totalOcupado = vagas._sum.vagasOcupadas || 0
    const taxaOcupacao = totalDisponivel > 0 ? Math.round((totalOcupado / totalDisponivel) * 100) : 0

    // 2. Total de Solicitações (No período)
    const totalSolicitacoes = await prisma.solicitacao.count({
        where: filtroData
    })

    // 3. Solicitações por Setor
    const porSetorRaw = await prisma.solicitacao.groupBy({
        by: ['setor'],
        where: filtroData,
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
        where: filtroData,
        _count: {
            id: true
        }
    })

    const porStatus = porStatusRaw.map(item => ({
        status: item.status,
        quantidade: item._count.id
    })).sort((a, b) => b.quantidade - a.quantidade)

    // 5. Custo Real (Soma do campo preco das aprovadas no período)
    const custoAgregado = await prisma.solicitacao.aggregate({
        where: {
            ...filtroData,
            status: 'APROVADO'
        },
        _sum: {
            preco: true
        },
        _count: {
            id: true
        }
    })

    const custoTotal = custoAgregado._sum.preco || 0
    const passagensEmitidas = custoAgregado._count.id

    // 6. Últimas Aprovações Financeiras (No período)
    const ultimasAprovacoes = await prisma.historicoAprovacao.findMany({
        where: {
            statusNovo: 'APROVADO',
            data: {
                gte: dataInicio,
                lte: dataFim
            }
        },
        take: 10,
        orderBy: {
            data: 'desc'
        },
        include: {
            solicitacao: {
                select: {
                    nomePassageiro: true,
                    setor: true,
                    preco: true, // Incluir preço na tabela
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
            passagensEmitidas
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
            aprovador: h.usuario.nome,
            preco: h.solicitacao.preco // Novo campo
        }))
    }
})
