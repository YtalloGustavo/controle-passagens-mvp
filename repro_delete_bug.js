
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Criando solicitação para testar exclusão...');

        // 1. Get Vaga
        console.log('Fetching vagas...');
        try {
            const resVagas = await fetch(`${BASE_URL}/vagas`);
            if (!resVagas.ok) throw new Error(`Falha ao buscar vagas: ${resVagas.status}`);
            var vagas = await resVagas.json();
        } catch (e) {
            console.error('SERVER UNREACHABLE?');
            throw e;
        }

        const vaga = vagas.find(v => v.vagasDisponiveis > v.vagasOcupadas);
        if (!vaga) throw new Error('Sem vagas disponíveis para teste.');

        // 2. Create
        console.log('Criando solicitação...');
        const resCreate = await fetch(`${BASE_URL}/solicitacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vagaId: vaga.id,
                nome: 'Teste Delete Debug',
                cpf: '999.999.999-99',
                dataNascimento: '1990-01-01',
                setor: 'TI',
                motivo: 'Debug Delete'
            })
        });

        const jsonCreate = await resCreate.json();
        if (!jsonCreate.success) throw new Error('Falha ao criar');
        const id = jsonCreate.id;
        console.log(`✅ Criado ID: ${id}`);

        // 3. Delete (Via Query)
        console.log(`🗑️ Tentando excluir ID: ${id} via QUERY...`);
        const resDelete = await fetch(`${BASE_URL}/solicitacoes?id=${id}`, {
            method: 'DELETE',
        });

        if (resDelete.status === 200) {
            console.log('✅ SUCESSO: Solicitação excluída via Query.');
        } else {
            console.error(`❌ ERRO: Status ${resDelete.status}`);
            console.error(await resDelete.text());
        }

    } catch (e) {
        console.error('❌ EXCEPTION:', e.message);
        if (e.cause) console.error(e.cause);
    }
}

run();
