import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const data = query.data as string
    const direcao = query.direcao as string

    if (!data || !direcao) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Parâmetros data e direcao são obrigatórios.'
        })
    }

    // Busca vagas para a data específica (ou todas do mês se for mais genérico, mas aqui é específico)
    // Na verdade, o frontend pede por data específica.
    // Vamos buscar vagas >= data para mostrar opções futuras também?
    // O frontend Solicitar.vue busca por data exata: `query: { data: dataViagem.value, direcao: 'IDA' }`
    // Mas a UI mostra uma lista "Voos Disponíveis". Se a data for exata, só retornaria 1.
    // Vamos fazer retornar vagas a partir da data informada, para dar opções.

    const dataInicio = new Date(data)

    const vagas = await prisma.vaga.findMany({
        where: {
            data: {
                gte: dataInicio
            },
            direcao: direcao,
            bloqueado: false // Opcional: frontend já filtra, mas bom garantir
        },
        orderBy: {
            data: 'asc'
        },
        take: 10 // Limita a 10 opções futuras
    })

    return vagas
})
