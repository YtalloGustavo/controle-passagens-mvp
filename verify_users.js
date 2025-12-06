
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Verificando API de Usuários...');

        const res = await fetch(`${BASE_URL}/usuarios`);
        if (!res.ok) throw new Error(`Erro ao buscar usuários: ${res.status}`);

        const usuarios = await res.json();

        console.log(`\n👥 Total de usuários: ${usuarios.length}`);

        if (usuarios.length > 0) {
            const primeiro = usuarios[0];
            console.log('Exemplo de usuário:', JSON.stringify(primeiro, null, 2));

            if (!primeiro.email) throw new Error('❌ Campo EMAIL está faltando!');
            if (!primeiro.perfil) throw new Error('❌ Campo PERFIL está faltando!');

            console.log('✅ Campos obrigatórios presentes (nome, email, perfil).');
        } else {
            console.warn('⚠️ Lista de usuários vazia.');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

run();
