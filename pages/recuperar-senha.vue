<script setup lang="ts">
const email = ref('')
const enviado = ref(false)
const carregando = ref(false)

const recuperar = async () => {
  if (!email.value) return
  
  carregando.value = true
  // Simulação de envio de email
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  carregando.value = false
  enviado.value = true
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-slate-900">
    
    <div class="absolute inset-0 z-0 opacity-30">
      <img 
        src="/public/fundo-norornha.jpg" 
        alt="Background" 
        class="w-full h-full object-cover"
      />
    </div>

    <div class="relative z-10 w-full max-w-md p-8 mx-4 bg-white rounded-2xl shadow-2xl">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🔐
        </div>
        <h1 class="text-2xl font-extrabold text-slate-800">Recuperar Senha</h1>
        <p class="text-slate-500 text-sm mt-2">Informe seu e-mail para receber as instruções.</p>
      </div>

      <div v-if="enviado" class="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center animate-fade-in">
        <div class="text-4xl mb-3">📧</div>
        <h3 class="text-emerald-800 font-bold text-lg mb-2">E-mail Enviado!</h3>
        <p class="text-emerald-600 text-sm mb-6">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
        <NuxtLink to="/" class="text-emerald-700 font-bold text-sm hover:underline">Voltar para o Login</NuxtLink>
      </div>

      <form v-else @submit.prevent="recuperar" class="space-y-6">
        
        <div class="space-y-1">
          <label class="text-sm font-bold text-slate-700 ml-1">Seu E-mail Corporativo</label>
          <input 
            v-model="email"
            type="email" 
            required
            class="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50"
            placeholder="nome@empresa.com"
          />
        </div>

        <button 
          type="submit"
          :disabled="carregando"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="carregando" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          <span v-else>Enviar Link de Recuperação</span>
        </button>

        <div class="text-center">
          <NuxtLink to="/" class="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors">
            Voltar para o Login
          </NuxtLink>
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
