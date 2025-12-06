
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('🚀 Verificando Módulo de Relatórios...');

        const res = await fetch(`${BASE_URL}/relatorios/geral`);
        if (!res.ok) throw new Error(`Erro ao buscar relatórios: ${res.status}`);

        const data = await res.json();

        console.log('\n📊 KPIs:');
        console.log(JSON.stringify(data.kpis, null, 2));

        if (!data.kpis.totalSolicitacoes) console.warn('⚠️ Nenhuma solicitação encontrada nos KPIs.');
        if (!data.graficos.porSetor.length) console.warn('⚠️ Gráfico por setor vazio.');
        if (!data.tabela.length) console.warn('⚠️ Tabela de aprovações vazia.');

        console.log('\n✅ Estrutura do relatório válida!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

run();
