import { execSync } from 'child_process';

const scripts = [
    'verify_flow.js',
    'verify_blocking.js',
    'verify_collaborators.js'
];

console.log('🚀 INICIANDO VERIFICAÇÃO GERAL DO SISTEMA 🚀\n');

let hasError = false;

for (const script of scripts) {
    console.log(`\n---------------------------------------------------`);
    console.log(`▶️  Executando: ${script}`);
    console.log(`---------------------------------------------------\n`);

    try {
        execSync(`node ${script}`, { stdio: 'inherit' });
        console.log(`\n✅ ${script} PASSOU`);
    } catch (error) {
        console.error(`\n❌ ${script} FALHOU`);
        hasError = true;
    }
}

console.log(`\n---------------------------------------------------`);
if (hasError) {
    console.error('❌ VERIFICAÇÃO GERAL FALHOU. Verifique os logs acima.');
    process.exit(1);
} else {
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉');
    process.exit(0);
}
