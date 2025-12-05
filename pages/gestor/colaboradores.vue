<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { usuario } = useAuth()
const { data: colaboradores, refresh } = await useFetch('/api/colaboradores', {
  query: { usuarioId: usuario.value?.id }
})

const showModal = ref(false)
const processando = ref(false)
const form = reactive({
  nome: '',
  cpf: '',
  dataNascimento: '',
  email: '',
  telefone: ''
})

const salvar = async () => {
  if (!form.nome || !form.cpf || !form.dataNascimento) return alert('Preencha os campos obrigatórios.')

  processando.value = true
  try {
    await $fetch('/api/colaboradores', {
      method: 'POST',
      body: {
        ...form,
        gestorId: usuario.value?.id
      }
    })
    await refresh()
    showModal.value = false
    // Reset form
    form.nome = ''
    form.cpf = ''
    form.dataNascimento = ''
    form.email = ''
    form.telefone = ''
  } catch (error: any) {
    alert(error.data?.statusMessage || 'Erro ao salvar.')
  } finally {
    processando.value = false
  }
}

const excluir = async (id: number) => {
  if (!confirm('Tem certeza que deseja remover este colaborador?')) return

  try {
    await $fetch('/api/colaboradores', {
      method: 'DELETE',
      body: { id }
    })
    await refresh()
  } catch (error) {
    alert('Erro ao excluir.')
  }
}

const formatData = (d: string) => new Date(d).toLocaleDateString('pt-BR')
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-sans text-slate-800">
    <!-- Sidebar -->
    <aside class="w-20 lg:w-72 bg-[#0F172A] text-white flex flex-col fixed h-full z-50 shadow-2xl border-r border-slate-800">
       <div class="h-24 flex items-center px-6 relative overflow-hidden">
        <div class="absolute top-0 left-10 w-20 h-20 bg-blue-500/20 blur-[40px] rounded-full pointer-events-none"></div>
        <div class="z-10 flex items-center gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
            <span class="text-xl transform -rotate-12">✈️</span>
          </div>
          <div class="hidden lg:block">
            <h1 class="font-bold text-lg tracking-wider">SkyPass</h1>
            <p class="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">Corporativo</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink to="/dashboard" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">dashboard</span>
          <span class="font-medium hidden lg:block">Visão Geral</span>
        </NuxtLink>
        
        <NuxtLink to="/solicitar" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-emerald-400 transition-colors">add_circle</span>
          <span class="font-medium hidden lg:block">Nova Solicitação</span>
        </NuxtLink>

         <NuxtLink to="/gestor/colaboradores" class="flex items-center gap-4 px-4 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all group">
          <span class="material-icons">people</span>
          <span class="font-medium hidden lg:block">Colaboradores</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px]">
      <header class="mb-10 flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Minha Equipe</h2>
          <p class="text-slate-500 mt-1">Gerencie os colaboradores do seu setor.</p>
        </div>
        <button @click="showModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all">
          <span class="material-icons">add</span>
          Novo Colaborador
        </button>
      </header>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th class="p-6">Nome</th>
              <th class="p-6">CPF</th>
              <th class="p-6">Nascimento</th>
              <th class="p-6">Contato</th>
              <th class="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="colab in colaboradores" :key="colab.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-6 font-bold text-slate-700">{{ colab.nome }}</td>
              <td class="p-6 font-mono text-slate-600">{{ colab.cpf }}</td>
              <td class="p-6 text-slate-600">{{ formatData(colab.dataNascimento) }}</td>
              <td class="p-6 text-slate-600">
                <div class="flex flex-col">
                  <span class="text-xs">{{ colab.email || '-' }}</span>
                  <span class="text-xs text-slate-400">{{ colab.telefone || '-' }}</span>
                </div>
              </td>
              <td class="p-6 text-right">
                <button @click="excluir(colab.id)" class="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
            <tr v-if="!colaboradores?.length">
              <td colspan="5" class="p-10 text-center text-slate-400">Nenhum colaborador cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Cadastro -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        <h3 class="text-xl font-bold text-slate-800 mb-6">Novo Colaborador</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
            <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">CPF *</label>
            <input v-model="form.cpf" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="000.000.000-00">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Nascimento *</label>
            <input v-model="form.dataNascimento" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
            <input v-model="form.email" type="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
            <input v-model="form.telefone" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none">
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="showModal = false" class="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
          <button @click="salvar" :disabled="processando" class="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex justify-center items-center">
             <span v-if="processando" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
             <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
