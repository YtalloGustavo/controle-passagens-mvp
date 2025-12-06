import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário é obrigatório.'
        })
    }

    // Dados para atualização
    const dataToUpdate: any = {
        nome: body.nome,
        email: body.email,
        perfil: body.perfil,
        setor: body.setor
    }

    // Só atualiza senha se for enviada
    if (body.senha) {
        const salt = bcrypt.genSaltSync(10)
        dataToUpdate.senha = bcrypt.hashSync(body.senha, salt)
    }

    try {
        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: Number(body.id) },
            data: dataToUpdate
        })

        return { message: 'Usuário atualizado com sucesso!', usuario: usuarioAtualizado }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro interno ao atualizar usuário.'
        })
    }
})
