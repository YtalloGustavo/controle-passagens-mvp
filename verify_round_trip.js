// import { fetch } from 'undici' // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000'

async function verifyRoundTrip() {
    console.log('--- INICIANDO VERIFICAÇÃO DE IDA E VOLTA ---')

    try {
        // 1. Buscar Vagas Disponíveis (IDA)
        // Usando data futura (2025 ou 2026) para ter chance de achar vagas livres
        console.log('1. Buscando vagas de IDA...')
        const resVagasIda = await fetch(`${BASE_URL}/api/vagas/disponibilidade?data=2025-01-01&direcao=IDA`)
        let vagasIda = await resVagasIda.json()

        // Filtra apenas vagas com disponibilidade real
        vagasIda = vagasIda.filter(v => (v.vagasDisponiveis + v.vagasExtras) > v.vagasOcupadas)

        if (!vagasIda || vagasIda.length === 0) {
            console.error('ERRO: Nenhuma vaga de IDA disponível encontrada para teste.')
            return
        }
        const vagaIda = vagasIda[0]
        console.log(`   - Vaga IDA selecionada: ID ${vagaIda.id} (${vagaIda.data})`)

        // 2. Buscar Vagas Disponíveis (VOLTA)
        console.log('2. Buscando vagas de VOLTA...')
        // Busca volta a partir da data da ida
        const dataIda = new Date(vagaIda.data).toISOString().split('T')[0]
        const resVagasVolta = await fetch(`${BASE_URL}/api/vagas/disponibilidade?data=${dataIda}&direcao=VOLTA`)
        let vagasVolta = await resVagasVolta.json()

        // Filtra vagas posteriores à ida e com disponibilidade
        vagasVolta = vagasVolta.filter(v =>
            new Date(v.data) > new Date(vagaIda.data) &&
            (v.vagasDisponiveis + v.vagasExtras) > v.vagasOcupadas
        )

        if (!vagasVolta || vagasVolta.length === 0) {
            console.error('ERRO: Nenhuma vaga de VOLTA disponível encontrada após a data de ida.')
            return
        }
        const vagaVolta = vagasVolta[0]
        console.log(`   - Vaga VOLTA selecionada: ID ${vagaVolta.id} (${vagaVolta.data})`)

        // 3. Criar Solicitação Ida e Volta
        console.log('3. Criando solicitação Ida e Volta...')
        const payload = {
            nome: 'Passageiro Teste Ida e Volta',
            cpf: '999.888.777-66',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste Automatizado Round Trip',
            vagaId: vagaIda.id,
            vagaVoltaId: vagaVolta.id
        }

        const resCreate = await fetch(`${BASE_URL}/api/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const dataCreate = await resCreate.json()

        if (resCreate.status === 200) {
            console.log(`   - SUCESSO: Solicitação criada com ID ${dataCreate.id}`)
        } else {
            console.error(`   - ERRO: Falha ao criar solicitação. Status: ${resCreate.status}`)
            console.error(dataCreate)
            return
        }

        // 4. Verificar Detalhes da Solicitação (Simulado via GET Lista)
        console.log('4. Verificando listagem...')
        const resList = await fetch(`${BASE_URL}/api/solicitacoes`)
        const lista = await resList.json()

        const solicitacao = lista.find(s => s.id === dataCreate.id)

        if (solicitacao && solicitacao.vagaVoltaId === vagaVolta.id) {
            console.log('   - SUCESSO: Solicitação encontrada com dados de volta corretos.')
        } else {
            console.error('   - ERRO: Dados da volta não conferem ou solicitação não encontrada.')
            console.log('     Esperado:', vagaVolta.id)
            console.log('     Encontrado:', solicitacao?.vagaVoltaId)
        }

    } catch (error) {
        console.error('ERRO CRÍTICO:', error)
    }
}

verifyRoundTrip()
