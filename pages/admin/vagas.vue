<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { usuario } = useAuth()
const { data: vagas, refresh } = await useFetch('/api/vagas')

// Computed para agrupar por mês ou apenas listar
const vagasList = computed(() => vagas.value || [])

const processando = ref<number | null>(null)

const toggleBloqueio = async (vaga: any) => {
  if (!usuario.value?.id) return

  processando.value = vaga.id
  try {
    const novoEstado = !vaga.bloqueado
    await $fetch('/api/vagas/bloquear', {
      method: 'POST',
      body: {
        vagaId: vaga.id,
        bloqueado: novoEstado,
        usuarioId: usuario.value.id
      }
    })
    await refresh()
  } catch (error: any) {
    alert('Erro ao atualizar vaga: ' + (error.data?.statusMessage || error.message))
  } finally {
    processando.value = null
  }
}

const formatData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-sans text-slate-800">
    <!-- Sidebar (Reutilizada ou Componentizada futuramente) -->
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
        
        <!-- Link Voltar -->
        <NuxtLink to="/dashboard" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group mt-10">
          <span class="material-icons group-hover:text-rose-400 transition-colors">arrow_back</span>
          <span class="font-medium hidden lg:block">Voltar</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px]">
      <header class="mb-10">
        <h2 class="text-3xl font-extrabold text-slate-900">Gerenciamento de Vagas</h2>
        <p class="text-slate-500 mt-1">Bloqueie datas para manutenção ou eventos especiais.</p>
      </header>

      <div v-if="usuario?.perfil !== 'MASTER' && usuario?.perfil !== 'ADMIN'" class="p-4 bg-rose-100 text-rose-700 rounded-xl border border-rose-200">
        Acesso restrito a Gerente Master.
      </div>

      <div v-else class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th class="p-6">Data</th>
                <th class="p-6">Direção</th>
                <th class="p-6 text-center">Disponíveis</th>
                <th class="p-6 text-center">Ocupadas</th>
                <th class="p-6 text-center">Status</th>
                <th class="p-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-for="vaga in vagasList" :key="vaga.id" class="hover:bg-slate-50 transition-colors">
                <td class="p-6 font-bold text-slate-700">{{ formatData(vaga.data) }}</td>
                <td class="p-6">
                  <span :class="`px-2 py-1 rounded text-[10px] font-bold uppercase ${vaga.direcao === 'IDA' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`">
                    {{ vaga.direcao }}
                  </span>
                </td>
                <td class="p-6 text-center font-mono text-slate-600">{{ vaga.vagasDisponiveis }}</td>
                <td class="p-6 text-center font-mono text-slate-600">{{ vaga.vagasOcupadas }}</td>
                <td class="p-6 text-center">
                  <span v-if="vaga.bloqueado" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
                    <span class="material-icons text-[14px]">lock</span> Bloqueado
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                    <span class="material-icons text-[14px]">check_circle</span> Ativo
                  </span>
                </td>
                <td class="p-6 text-right">
                  <button 
                    @click="toggleBloqueio(vaga)"
                    :disabled="processando === vaga.id"
                    :class="`px-4 py-2 rounded-lg font-bold text-xs transition-all ${vaga.bloqueado ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`"
                  >
                    <span v-if="processando === vaga.id" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                    <span v-else>{{ vaga.bloqueado ? 'Desbloquear' : 'Bloquear' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
