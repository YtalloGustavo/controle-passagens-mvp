
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Iniciando verificação do fluxo de aprovação via API...');

        // 0. Buscar Vaga Disponível
        console.log('\n0. Buscando vaga disponível...');
        const resVagas = await fetch(`${BASE_URL}/vagas`);
        const vagas = await resVagas.json();
        const vagaDisponivel = vagas.find(v => (v.vagasDisponiveis - v.vagasOcupadas) > 0 && !v.bloqueado);

        if (!vagaDisponivel) throw new Error('Nenhuma vaga disponível encontrada.');
        console.log(`✅ Vaga encontrada: ID ${vagaDisponivel.id} (${vagaDisponivel.data})`);

        // 1. Criar Solicitação
        console.log('\n1. Criando Solicitação...');
        const res1 = await fetch(`${BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vagaId: vagaDisponivel.id,
                nome: 'Teste API Flow',
                cpf: '000.000.000-00',
                dataNascimento: '1990-01-01',
                setor: 'TI',
                motivo: 'Teste de Fluxo'
            })
        });
        const json1 = await res1.json();
        if (!json1.success) {
            console.error('Erro na criação:', JSON.stringify(json1, null, 2));
            throw new Error('Falha ao criar solicitação');
        }
        const id = json1.id;
        console.log(`✅ Solicitação criada com ID: ${id}`);

        // 2. Aprovar pelo Gestor (ID 1 - Carlos Gestor)
        console.log('\n2. Aprovando pelo Gestor...');
        await aprovar(id, 1, 'ANALISE_PASSAGEM');

        // 3. Aprovar pela Passagem (ID 2 - Ana Passagens)
        console.log('\n3. Aprovando pela Passagem...');
        await aprovar(id, 2, 'ANALISE_HOSPEDAGEM');

        // 4. Aprovar pela Hospedagem (ID 4 - Mariana Hospedagem)
        console.log('\n4. Aprovando pela Hospedagem...');
        await aprovar(id, 4, 'VERIFICACAO_VOLTA', { tipo: 'CASA_FUNCIONAL', info: 'Casa 01' });

        // 5. Confirmar Volta pela Passagem (ID 2 - Ana Passagens)
        console.log('\n5. Confirmando Volta (Passagem)...');
        await aprovar(id, 2, 'APROVACAO_ADMIN');

        // 6. Aprovar pelo Admin (ID 3 - Administrador)
        console.log('\n6. Aprovando pelo Admin...');
        await aprovar(id, 3, 'ANALISE_FINANCEIRO');

        // 7. Aprovar pelo Financeiro (ID 5 - Roberto Financeiro)
        console.log('\n7. Aprovando pelo Financeiro...');
        await aprovar(id, 5, 'APROVADO');

        console.log('\n🎉 Fluxo completo verificado com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante a verificação:', error.message);
        if (error.cause) console.error(error.cause);
    }
}

async function aprovar(solicitacaoId, usuarioId, statusEsperado, detalhesHospedagem = null) {
    const res = await fetch(`${BASE_URL}/solicitacoes/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            solicitacaoId,
            usuarioId,
            acao: 'APROVAR',
            detalhesHospedagem
        })
    });

    if (!res.ok) {
        const text = await res.text();
        try {
            const err = JSON.parse(text);
            throw new Error(`Falha na aprovação: ${err.statusMessage}`, { cause: err });
        } catch (e) {
            console.error('Erro não-JSON recebido:', text.substring(0, 500));
            throw new Error(`Falha na aprovação (Status ${res.status}): ${text.substring(0, 200)}`);
        }
    }

    const json = await res.json();
    if (json.novoStatus !== statusEsperado) {
        throw new Error(`Status incorreto. Esperado: ${statusEsperado}, Recebido: ${json.novoStatus}`);
    }
    console.log(`✅ Aprovado! Novo status: ${json.novoStatus}`);
}

run();
