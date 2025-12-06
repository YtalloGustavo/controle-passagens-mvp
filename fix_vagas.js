import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixVagas() {
    console.log('--- INICIANDO CORREÇÃO DE VAGAS ---')

    const vagas = await prisma.vaga.findMany()
    let corrigidos = 0

    for (const v of vagas) {
        // Contar solicitações reais para esta vaga (que não estejam recusadas)
        const countIda = await prisma.solicitacao.count({
            where: {
                vagaId: v.id,
                status: { not: 'RECUSADO' }
            }
        })
        const countVolta = await prisma.solicitacao.count({
            where: {
                vagaVoltaId: v.id,
                status: { not: 'RECUSADO' }
            }
        })
        const totalReal = countIda + countVolta

        if (v.vagasOcupadas !== totalReal) {
            console.log(`Corrigindo Vaga ID ${v.id}: ${v.vagasOcupadas} -> ${totalReal}`)
            await prisma.vaga.update({
                where: { id: v.id },
                data: { vagasOcupadas: totalReal }
            })
            corrigidos++
        }
    }
    console.log(`--- CORREÇÃO CONCLUÍDA. ${corrigidos} vagas atualizadas. ---`)
}

fixVagas()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
