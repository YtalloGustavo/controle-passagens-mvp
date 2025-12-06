
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Verificando CRUD de Usuários...');

        // 1. CRIAR USUÁRIO
        console.log('\n1️⃣ Criando usuário de teste...');
        const novoUsuario = {
            nome: 'Teste CRUD',
            email: `teste_crud_${Date.now()}@sistema.com`,
            senha: '123',
            perfil: 'GESTOR',
            setor: 'TESTE'
        };

        const resCreate = await fetch(`${BASE_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (!resCreate.ok) {
            const err = await resCreate.json();
            throw new Error(`Erro ao criar: ${err.statusMessage}`);
        }

        const dataCreate = await resCreate.json();
        const userId = dataCreate.id;
        console.log(`✅ Usuário criado com ID: ${userId}`);

        // 2. ATUALIZAR USUÁRIO
        console.log('\n2️⃣ Atualizando usuário...');
        const updateData = {
            id: userId,
            nome: 'Teste CRUD Atualizado',
            email: novoUsuario.email,
            perfil: 'ADMIN',
            setor: 'QA'
        };

        const resUpdate = await fetch(`${BASE_URL}/usuarios`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!resUpdate.ok) {
            const err = await resUpdate.json();
            throw new Error(`Erro ao atualizar: ${err.statusMessage}`);
        }
        console.log('✅ Usuário atualizado com sucesso.');

        // 3. EXCLUIR USUÁRIO
        console.log('\n3️⃣ Excluindo usuário...');
        const resDelete = await fetch(`${BASE_URL}/usuarios`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId })
        });

        if (!resDelete.ok) {
            const err = await resDelete.json();
            throw new Error(`Erro ao excluir: ${err.statusMessage}`);
        }
        console.log('✅ Usuário excluído com sucesso.');

        console.log('\n🎉 CRUD verificado com sucesso!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

run();
