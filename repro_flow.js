// import { fetch } from 'undici' // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api'

async function reproFlow() {
    console.log('--- REPRODUÇÃO DE FLUXO (MASTER) ---')

    // 1. Buscar Vaga Disponível
    const resVagas = await fetch(`${BASE_URL}/vagas`)
    const vagas = await resVagas.json()
    const vaga = vagas.find(v => !v.bloqueado && v.vagasDisponiveis > v.vagasOcupadas)

    if (!vaga) {
        console.error('Sem vagas.')
        return
    }

    // 2. Criar Solicitação (Status Inicial: ANALISE_GESTOR)
    console.log('1. Criando Solicitação...')
    const res1 = await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vaga.id,
            nome: 'Teste Flow',
            cpf: '999.999.999-99',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste Flow'
        })
    })
    const json1 = await res1.json()
    const id = json1.id
    console.log(`   - Solicitação criada: ${id}`)

    // 3. Buscar Usuário MASTER
    const resUsers = await fetch(`${BASE_URL}/usuarios`)
    const users = await resUsers.json()
    const master = users.find(u => u.perfil === 'MASTER')

    if (!master) {
        console.error('Usuário MASTER não encontrado.')
        return
    }
    console.log(`   - Usuário Master: ${master.nome} (ID: ${master.id})`)

    // 4. Aprovar como MASTER
    console.log('2. Aprovando como MASTER (deve ir para ANALISE_PASSAGEM)...')
    const resAprovar = await fetch(`${BASE_URL}/solicitacoes/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            solicitacaoId: id,
            usuarioId: master.id,
            acao: 'APROVAR'
        })
    })
    const jsonAprovar = await resAprovar.json()
    console.log(`   - Resposta API:`, jsonAprovar)

    // 5. Verificar Status Final
    const resCheck = await fetch(`${BASE_URL}/solicitacoes`)
    const solicitacoes = await resCheck.json()
    const sol = solicitacoes.find(s => s.id === id)
    console.log(`   - Status Final no Banco: ${sol.status}`)

    if (sol.status === 'ANALISE_PASSAGEM') {
        console.log('   - SUCESSO: Status atualizado corretamente.')
    } else {
        console.error(`   - FALHA: Status não mudou ou mudou errado. Esperado: ANALISE_PASSAGEM, Atual: ${sol.status}`)
    }

    console.log('--- FIM DA REPRODUÇÃO ---')
}

reproFlow()
