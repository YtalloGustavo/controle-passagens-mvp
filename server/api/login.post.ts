// server/api/login.post.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

    if (!usuario) {
        throw createError({ statusCode: 401, statusMessage: 'E-mail ou senha incorretos.' })
    }

    // 3. Verificar senha
    // Se a senha no banco não parece um hash bcrypt (não começa com $2a$ ou similar),
    // tentamos comparar como texto simples (para compatibilidade durante migração ou erro)
    // MAS, por segurança, vamos assumir que deve ser hash.
    // Se falhar o compareSync, verifica se é igual a string (fallback temporário APENAS se necessário, 
    // mas melhor forçar a migração).

    const senhaCorreta = bcrypt.compareSync(body.senha, usuario.senha)

    // Fallback para senhas antigas não migradas (Opcional, mas útil no dev)
    const senhaLegada = usuario.senha === body.senha

    if (!senhaCorreta && !senhaLegada) {
        throw createError({ statusCode: 401, statusMessage: 'E-mail ou senha incorretos.' })
    }

    // Se logou com senha legada, poderíamos atualizar o hash aqui automaticamente, 
    // mas vamos deixar para o script de migração.

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