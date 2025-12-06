// import { fetch } from 'undici' // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api'

async function verifyMaster() {
    console.log('--- INICIANDO VERIFICAÇÃO DE MASTER ---')

    // 1. Criar Solicitação
    console.log('1. Criando Solicitação...')
    // Buscar vaga
    const resVagas = await fetch(`${BASE_URL}/vagas`)
    const vagas = await resVagas.json()
    const vagaDisponivel = vagas.find(v => (v.vagasDisponiveis - v.vagasOcupadas) > 0 && !v.bloqueado)

    if (!vagaDisponivel) {
        console.error('Sem vagas.')
        return
    }

    const res1 = await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vagaDisponivel.id,
            nome: 'Teste Master',
            cpf: '000.000.000-00',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste Master'
        })
    })
    const json1 = await res1.json()
    const id = json1.id
    console.log(`   - Solicitação criada: ${id}`)

    // 2. Tentar Aprovar como MASTER (ID 6 - Diretor Master)
    // O backend já permitia, o problema era o frontend não mostrar.
    // Como este script testa a API, ele deve funcionar se o backend estiver certo.
    // O frontend foi corrigido visualmente.

    console.log('2. Aprovando como MASTER (Diretor)...')
    // Assumindo que ID 6 é Master (baseado no seed ou criação anterior)
    // Se não existir, vai falhar. Vou buscar o ID do master.
    const resUsers = await fetch(`${BASE_URL}/usuarios`)
    const users = await resUsers.json()
    const master = users.find(u => u.perfil === 'MASTER')

    if (!master) {
        console.error('Usuário MASTER não encontrado.')
        return
    }

    const resAprovar = await fetch(`${BASE_URL}/solicitacoes/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            solicitacaoId: id,
            usuarioId: master.id,
            acao: 'APROVAR'
        })
    })

    if (resAprovar.status === 200) {
        console.log('   - SUCESSO: Master aprovou solicitação.')
        const jsonAprovar = await resAprovar.json()
        console.log(`   - Novo Status: ${jsonAprovar.novoStatus}`)
    } else {
        console.error(`   - ERRO: Falha na aprovação. Status: ${resAprovar.status}`)
        console.error(await resAprovar.json())
    }
}

verifyMaster()
