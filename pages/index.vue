<script setup lang="ts">
const { logar } = useAuth() // Importa a função de login global

// Estados do formulário
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const mensagemErro = ref('') // Para mostrar erro na tela

const fazerLogin = async () => {
  // 1. Limpa erros anteriores
  mensagemErro.value = ''

  // 2. Validação Frontend (Campos vazios)
  if (!email.value || !senha.value) {
    mensagemErro.value = 'Por favor, preencha o e-mail e a senha.'
    return
  }
  
  carregando.value = true
  
  try {
    // 3. Chamada à API Real
    // O body envia os dados para server/api/login.post.ts
    const usuario = await $fetch('/api/login', {
      method: 'POST',
      body: { 
        email: email.value, 
        senha: senha.value 
      }
    })

    // 4. Se chegou aqui, o login foi SUCESSO!
    logar(usuario) // Salva na memória
    navigateTo('/dashboard') // Redireciona

  } catch (error: any) {
    // 5. Se deu erro (401 ou 404), captura a mensagem
    console.error('Erro no login:', error)
    mensagemErro.value = error.data?.statusMessage || 'E-mail ou senha incorretos.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
    
    <div class="absolute inset-0 z-0">
      <img 
        src="/public/fundo-norornha.jpg" 
        alt="Fernando de Noronha" 
        class="w-full h-full object-cover animation-zoom"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-black/50"></div>
    </div>

    <div class="relative z-10 w-full max-w-md p-8 mx-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
      
      <div class="text-center mb-8">
        <p class="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2">Sistema Corporativo</p>
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">SkyPass</h1>
        <div class="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium mt-2">
          <span>Recife</span>
          <span class="text-blue-500">✈</span>
          <span>Noronha</span>
        </div>
      </div>

      <form @submit.prevent="fazerLogin" class="space-y-5">
        
        <div v-if="mensagemErro" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-bold">
          {{ mensagemErro }}
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold text-gray-700 ml-1">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-400">✉️</span></div>
            <input 
              v-model="email"
              type="email" 
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="gestor@ti.com"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold text-gray-700 ml-1">Senha</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-400">🔒</span></div>
            <input 
              v-model="senha"
              type="password" 
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="••••••••"
            />
          </div>
          <div class="flex justify-end mt-1">
            <NuxtLink to="/recuperar-senha" class="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
              Esqueci minha senha
            </NuxtLink>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="carregando"
          class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="carregando" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          <span v-else>Entrar no Sistema</span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <p class="text-xs text-gray-400">© 2025 Gestão de Logística Aérea.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes subtleZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}
.animation-zoom {
  animation: subtleZoom 20s infinite alternate ease-in-out;
}
</style>