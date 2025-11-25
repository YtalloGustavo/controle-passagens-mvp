// server/api/solicitacoes.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
    // Busca as solicitações e inclui os dados do voo (vaga)
    const solicitacoes = await prisma.solicitacao.findMany({
        include: {
            vaga: true, // Importante: Traz a data e direção do voo junto
            historico: true // Traz o histórico de aprovações
        },
        orderBy: {
            criadoEm: 'desc' // As mais recentes primeiro
        }
    })

    return solicitacoes
})