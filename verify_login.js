// import { fetch } from 'undici' // Native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api'

async function verifyLogin() {
    console.log('--- INICIANDO VERIFICAÇÃO DE LOGIN ---')

    // 1. Testar Login com Senha Correta (que foi migrada)
    // Assumindo que existe um usuário 'gestor@sistema.com' com senha '123456' (padrão do seed)
    // Se o seed foi diferente, isso pode falhar.

    // Vou tentar criar um usuário novo para garantir
    console.log('1. Criando usuário de teste...')
    const emailTeste = `teste_login_${Date.now()}@sistema.com`
    const senhaTeste = 'senhaSecreta123'

    const resCreate = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'Usuário Teste Login',
            email: emailTeste,
            senha: senhaTeste,
            perfil: 'GESTOR'
        })
    })

    if (resCreate.status !== 200) {
        console.error('ERRO: Falha ao criar usuário de teste.')
        const err = await resCreate.json()
        console.error(err)
        return
    }
    console.log('   - Usuário criado com sucesso.')

    // 2. Tentar Login com a senha correta
    console.log('2. Tentando login com senha correta...')
    const resLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailTeste,
            senha: senhaTeste
        })
    })

    if (resLogin.status === 200) {
        console.log('   - SUCESSO: Login realizado em /api/login')
    } else {
        console.error(`   - ERRO: Falha no login. Status: ${resLogin.status}`)
        console.error(await resLogin.json())
    }

    // 3. Tentar Login com senha incorreta
    console.log('3. Tentando login com senha INCORRETA...')
    const resLoginErrado = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailTeste,
            senha: 'senhaErrada'
        })
    })

    if (resLoginErrado.status === 401) {
        console.log('   - SUCESSO: Login recusado corretamente (401).')
    } else {
        console.error(`   - ERRO: Login deveria falhar mas retornou ${resLoginErrado.status}`)
    }
}

verifyLogin()
