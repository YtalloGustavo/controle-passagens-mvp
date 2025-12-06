
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Verificando CRUD de Solicitações...');

        // 0. Buscar uma vaga válida para criar a solicitação
        const resVagas = await fetch(`${BASE_URL}/vagas`);
        const vagas = await resVagas.json();
        const vagaDisponivel = vagas.find(v => !v.bloqueado && v.vagasDisponiveis > v.vagasOcupadas);

        if (!vagaDisponivel) {
            throw new Error('Nenhuma vaga disponível para teste.');
        }

        // 1. CRIAR SOLICITAÇÃO (Simulando via API existente)
        console.log('\n1️⃣ Criando solicitação de teste...');
        const novaSolicitacao = {
            vagaId: vagaDisponivel.id,
            nomePassageiro: 'Passageiro Teste CRUD',
            cpfPassageiro: '123.456.789-00',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste de CRUD'
        };

        const resCreate = await fetch(`${BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaSolicitacao)
        });

        if (!resCreate.ok) {
            const err = await resCreate.json();
            throw new Error(`Erro ao criar: ${err.statusMessage}`);
        }

        const dataCreate = await resCreate.json();
        const solicitacaoId = dataCreate.id;
        console.log(`✅ Solicitação criada com ID: ${solicitacaoId}`);

        // 2. ATUALIZAR SOLICITAÇÃO
        console.log('\n2️⃣ Atualizando solicitação...');
        const updateData = {
            id: solicitacaoId,
            nomePassageiro: 'Passageiro Atualizado',
            cpfPassageiro: '999.888.777-66',
            motivo: 'Motivo Atualizado'
        };

        const resUpdate = await fetch(`${BASE_URL}/solicitacoes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!resUpdate.ok) {
            const err = await resUpdate.json();
            throw new Error(`Erro ao atualizar: ${err.statusMessage}`);
        }
        console.log('✅ Solicitação atualizada com sucesso.');

        // 3. EXCLUIR SOLICITAÇÃO
        console.log('\n3️⃣ Excluindo solicitação...');
        const resDelete = await fetch(`${BASE_URL}/solicitacoes`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: solicitacaoId })
        });

        if (!resDelete.ok) {
            const err = await resDelete.json();
            throw new Error(`Erro ao excluir: ${err.statusMessage}`);
        }
        console.log('✅ Solicitação excluída com sucesso.');

        console.log('\n🎉 CRUD de Solicitações verificado com sucesso!');

    } catch (error) {
        console.error('❌ Erro Fatal:', error);
        if (error.cause) console.error('Causa:', error.cause);
    }
}

run();
