import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validação
    if (!body.nome || !body.cpf || !body.dataNascimento || !body.gestorId) {
        throw createError({ statusCode: 400, statusMessage: 'Dados incompletos.' })
    }

    // Verificar se CPF já existe
    const cpfExiste = await prisma.colaborador.findUnique({
        where: { cpf: body.cpf }
    })

    if (cpfExiste) {
        throw createError({ statusCode: 400, statusMessage: 'CPF já cadastrado.' })
    }

    // Criar
    const colaborador = await prisma.colaborador.create({
        data: {
            nome: body.nome,
            cpf: body.cpf,
            dataNascimento: new Date(body.dataNascimento),
            email: body.email,
            telefone: body.telefone,
            gestorId: body.gestorId
        }
    })

    return colaborador
})
