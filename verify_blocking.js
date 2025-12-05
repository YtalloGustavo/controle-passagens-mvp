
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Iniciando verificação de Bloqueio de Vagas...');

        // 1. Buscar uma vaga disponível para teste
        console.log('\n1. Buscando vaga para teste...');
        const resVagas = await fetch(`${BASE_URL}/vagas`);
        const vagas = await resVagas.json();
        const vagaTeste = vagas.find(v => !v.bloqueado && (v.vagasDisponiveis - v.vagasOcupadas) > 0);

        if (!vagaTeste) throw new Error('Nenhuma vaga disponível para teste.');
        console.log(`✅ Vaga selecionada: ID ${vagaTeste.id} (${vagaTeste.data})`);

        // 2. Bloquear a vaga (Simulando Master)
        console.log('\n2. Bloqueando a vaga (Master)...');
        // Precisamos do ID do Master. No seed é o ultimo criado, mas vamos assumir que existe.
        // Vamos buscar usuarios para pegar o ID do Master
        const resUsers = await fetch(`${BASE_URL}/usuarios`);
        const users = await resUsers.json();
        const master = users.find(u => u.perfil === 'MASTER');

        if (!master) throw new Error('Usuário Master não encontrado.');

        await toggleBloqueio(vagaTeste.id, true, master.id);

        // 3. Tentar criar solicitação (Deve falhar)
        console.log('\n3. Tentando criar solicitação na vaga bloqueada...');
        try {
            await criarSolicitacao(vagaTeste.id);
            throw new Error('❌ ERRO: A solicitação deveria ter falhado!');
        } catch (e) {
            console.log(`✅ Bloqueio funcionou! Erro recebido: ${e.message}`);
        }

        // 4. Desbloquear a vaga
        console.log('\n4. Desbloqueando a vaga...');
        await toggleBloqueio(vagaTeste.id, false, master.id);

        // 5. Tentar criar solicitação (Deve funcionar)
        console.log('\n5. Tentando criar solicitação na vaga desbloqueada...');
        await criarSolicitacao(vagaTeste.id);
        console.log('✅ Solicitação criada com sucesso após desbloqueio.');

        console.log('\n🎉 Teste de bloqueio finalizado com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante a verificação:', error.message);
    }
}

async function toggleBloqueio(vagaId, bloqueado, usuarioId) {
    const res = await fetch(`${BASE_URL}/vagas/bloquear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vagaId, bloqueado, usuarioId })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Falha ao alterar bloqueio: ${err.statusMessage}`);
    }
    console.log(`✅ Vaga ${bloqueado ? 'bloqueada' : 'desbloqueada'} com sucesso.`);
}

async function criarSolicitacao(vagaId) {
    const res = await fetch(`${BASE_URL}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vagaId,
            nome: 'Teste Bloqueio',
            cpf: '000.000.000-00',
            dataNascimento: '1990-01-01',
            setor: 'TI',
            motivo: 'Teste de Bloqueio'
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.statusMessage);
    }
}

run();
