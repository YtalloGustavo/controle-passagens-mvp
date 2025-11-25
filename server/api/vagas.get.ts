// server/api/vagas.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
    // Busca todas as vagas no banco, ordenadas por data
    const vagas = await prisma.vaga.findMany({
        orderBy: [
            { data: 'asc' }, // Ordena por data (crescente)
            { direcao: 'asc' } // Depois por direção
        ]
    })

    return vagas
})