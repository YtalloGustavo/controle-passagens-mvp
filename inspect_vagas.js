import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspectVagas() {
    console.log('--- INSPECIONANDO VAGAS ---')

    const vagas = await prisma.vaga.findMany({
        orderBy: { data: 'asc' }
    })

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
            console.log(`ID: ${v.id} | Data: ${v.data.toISOString()} | Dir: ${v.direcao}`)
            console.log(`   - Disponíveis: ${v.vagasDisponiveis}`)
            console.log(`   - Ocupadas (DB): ${v.vagasOcupadas}`)
            console.log(`   - Ocupadas (Real): ${totalReal}`)
            console.warn(`   >>> DESINCRONIA DETECTADA! Diferença: ${v.vagasOcupadas - totalReal}`)
            console.log('------------------------------------------------')
        }
    }
    console.log('--- INSPEÇÃO CONCLUÍDA ---')
}

inspectVagas()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
