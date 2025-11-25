// server/api/login.post.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Validar se enviou e-mail e senha
    if (!body.email || !body.senha) {
        throw createError({ statusCode: 400, statusMessage: 'E-mail e senha são obrigatórios.' })
    }

    // 2. Procurar o usuário no banco
    const usuario = await prisma.usuario.findUnique({
        where: { email: body.email }
    })

    // 3. Verificar senha (para o MVP é texto simples)
    if (!usuario || usuario.senha !== body.senha) {
        throw createError({ statusCode: 401, statusMessage: 'E-mail ou senha incorretos.' })
    }

    // 4. Sucesso! Retorna os dados (menos a senha)
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor,
        token: 'token-falso-mvp-123'
    }
})