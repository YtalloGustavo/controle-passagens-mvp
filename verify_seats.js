// import { fetch } from 'undici' // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api'

async function verifySeats() {
    console.log('--- INICIANDO VERIFICAÇÃO DE ASSENTOS ---')

    // 1. Buscar Vaga Disponível
    const resVagas = await fetch(`${BASE_URL}/vagas`)
    const vagas = await resVagas.json()
    const vaga = vagas.find(v => !v.bloqueado && v.vagasDisponiveis > v.vagasOcupadas)

    if (!vaga) {
        console.error('Sem vagas disponíveis para teste.')
        return
    }

    const ocupadasInicial = vaga.vagasOcupadas
    console.log(`1. Vaga Selecionada: ${vaga.id} (${vaga.direcao} - ${vaga.data})`)
    console.log(`   - Ocupadas Inicial: ${ocupadasInicial}`)

    // 2. Criar Solicitação (Deve incrementar ocupadas)
    console.log('2. Criando Solicitação...')
    const res1 = await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vaga.id,
            nome: 'Teste Assento',
            cpf: '111.111.111-11',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste Assento'
        })
    })
    const json1 = await res1.json()
    const id = json1.id
    console.log(`   - Solicitação criada: ${id}`)

    // Verificar se incrementou
    const resVagas2 = await fetch(`${BASE_URL}/vagas`)
    const vagas2 = await resVagas2.json()
    const vaga2 = vagas2.find(v => v.id === vaga.id)
    console.log(`   - Ocupadas Após Criação: ${vaga2.vagasOcupadas} (Esperado: ${ocupadasInicial + 1})`)

    if (vaga2.vagasOcupadas !== ocupadasInicial + 1) {
        console.error('ERRO: Não incrementou assentos.')
        return
    }

    // 3. Deletar Solicitação (Deve decrementar ocupadas)
    console.log('3. Deletando Solicitação...')
    await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })

    // Verificar se decrementou
    const resVagas3 = await fetch(`${BASE_URL}/vagas`)
    const vagas3 = await resVagas3.json()
    const vaga3 = vagas3.find(v => v.id === vaga.id)
    console.log(`   - Ocupadas Após Deleção: ${vaga3.vagasOcupadas} (Esperado: ${ocupadasInicial})`)

    if (vaga3.vagasOcupadas === ocupadasInicial) {
        console.log('   - SUCESSO: Assentos restaurados após deleção.')
    } else {
        console.error('ERRO: Não restaurou assentos após deleção.')
    }

    // 4. Teste de Rejeição
    console.log('4. Testando Rejeição...')
    // Criar de novo
    const res4 = await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId: vaga.id,
            nome: 'Teste Rejeicao',
            cpf: '222.222.222-22',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste Rejeicao'
        })
    })
    const json4 = await res4.json()
    const id4 = json4.id
    console.log(`   - Solicitação criada: ${id4}`)

    // Rejeitar (Precisa de um usuário com permissão, vou usar o Master se achar, ou Gestor)
    const resUsers = await fetch(`${BASE_URL}/usuarios`)
    const users = await resUsers.json()
    const gestor = users.find(u => u.perfil === 'GESTOR') // Gestor pode rejeitar na primeira etapa

    if (gestor) {
        await fetch(`${BASE_URL}/solicitacoes/aprovar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                solicitacaoId: id4,
                usuarioId: gestor.id,
                acao: 'RECUSAR'
            })
        })
        console.log('   - Solicitação recusada.')

        // Verificar se decrementou
        const resVagas5 = await fetch(`${BASE_URL}/vagas`)
        const vagas5 = await resVagas5.json()
        const vaga5 = vagas5.find(v => v.id === vaga.id)
        console.log(`   - Ocupadas Após Rejeição: ${vaga5.vagasOcupadas} (Esperado: ${ocupadasInicial})`)

        if (vaga5.vagasOcupadas === ocupadasInicial) {
            console.log('   - SUCESSO: Assentos restaurados após rejeição.')
        } else {
            console.error('ERRO: Não restaurou assentos após rejeição.')
        }
    } else {
        console.warn('Sem usuário GESTOR para testar rejeição.')
    }

    console.log('--- VERIFICAÇÃO CONCLUÍDA ---')
}

verifySeats()
