// const fetch = require('node-fetch'); // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api';

// Mock de dados para teste
const GESTOR_ID = 1; // Assumindo que o usuário ID 1 é um Gestor (ou tem permissão)
const NOVO_COLABORADOR = {
    nome: 'Colaborador Teste Automatizado',
    cpf: '999.888.777-66',
    dataNascimento: '1990-01-01',
    email: 'colab.teste@empresa.com',
    telefone: '81999998888',
    gestorId: GESTOR_ID
};

async function run() {
    console.log('🚀 Iniciando verificação de Gestão de Colaboradores...\n');

    try {
        // 1. Criar Colaborador
        console.log('1. Criando novo colaborador...');
        const resCreate = await fetch(`${BASE_URL}/colaboradores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(NOVO_COLABORADOR)
        });

        if (!resCreate.ok) {
            const text = await resCreate.text();
            throw new Error(`Falha ao criar: ${text}`);
        }

        const colaboradorCriado = await resCreate.json();
        console.log(`✅ Colaborador criado: ID ${colaboradorCriado.id} - ${colaboradorCriado.nome}`);

        // 2. Listar Colaboradores
        console.log('\n2. Listando colaboradores do gestor...');
        const resList = await fetch(`${BASE_URL}/colaboradores?usuarioId=${GESTOR_ID}`);
        const lista = await resList.json();

        const encontrado = lista.find(c => c.id === colaboradorCriado.id);
        if (!encontrado) throw new Error('Colaborador criado não foi encontrado na lista.');
        console.log(`✅ Colaborador encontrado na lista com sucesso.`);

        // 3. Deletar Colaborador (Limpeza)
        console.log('\n3. Removendo colaborador de teste...');
        const resDelete = await fetch(`${BASE_URL}/colaboradores`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: colaboradorCriado.id })
        });

        if (!resDelete.ok) throw new Error('Falha ao deletar colaborador.');
        console.log('✅ Colaborador removido com sucesso.');

        console.log('\n🎉 Verificação concluída com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante a verificação:', error.message);
        process.exit(1);
    }
}

run();
