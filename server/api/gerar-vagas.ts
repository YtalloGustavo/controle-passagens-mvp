import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
    const hoje = new Date()
    const diasParaGerar = 30 // Vamos gerar vagas para um mês
    let log = []

    for (let i = 0; i < diasParaGerar; i++) {
        // Cria uma data nova baseada em "hoje + i dias"
        const dataAtual = new Date(hoje)
        dataAtual.setDate(hoje.getDate() + i)
        dataAtual.setHours(0, 0, 0, 0) // Zera as horas para ficar limpo

        const diaDoMes = dataAtual.getDate()

        // --- REGRA DE NEGÓCIO  ---
        // Se o dia for par (resto da divisão por 2 é 0) = 15 vagas
        // Se for ímpar = 10 vagas
        const totalVagas = (diaDoMes % 2 === 0) ? 15 : 10

        // Criamos Vagas para IDA e para VOLTA [cite: 2]
        const direcoes = ['IDA', 'VOLTA']

        for (const direcao of direcoes) {
            // O 'upsert' cria se não existir, ou atualiza se já existir (evita duplicatas)
            await prisma.vaga.upsert({
                where: {
                    data_direcao: {
                        data: dataAtual,
                        direcao: direcao
                    }
                },
                update: {
                    vagasDisponiveis: totalVagas
                },
                create: {
                    data: dataAtual,
                    direcao: direcao,
                    vagasDisponiveis: totalVagas,
                    vagasExtras: 0
                }
            })
        }

        log.push(`Dia ${diaDoMes} (${direcoes.join('/')}): ${totalVagas} vagas criadas.`)
    }

    return {
        status: 'Sucesso',
        mensagem: 'Vagas geradas para 30 dias!',
        detalhes: log
    }
})