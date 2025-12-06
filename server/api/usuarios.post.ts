import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validação de Campos Obrigatórios
    if (!body.nome || !body.email || !body.senha || !body.perfil) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Campos obrigatórios: nome, email, senha, perfil.'
        })
    }

    // 2. Verificar se email já existe
    const existente = await prisma.usuario.findUnique({
        where: { email: body.email }
    })

    if (existente) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Email já cadastrado.'
        })
    }

    // 3. Criar Usuário
    try {
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: body.nome,
                email: body.email,
                senha: body.senha, // TODO: Hash da senha em produção
                perfil: body.perfil,
                setor: body.setor || null
            }
        })

        return { message: 'Usuário criado com sucesso!', id: novoUsuario.id }
    } catch (error) {
        console.error('Erro ao criar usuário:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro interno ao criar usuário.'
        })
    }
})
