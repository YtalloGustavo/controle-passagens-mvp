<script setup lang="ts">
// --- DADOS E ESTADO ---
const { data: vagas, pending } = await useFetch('/api/vagas')
const { usuario } = useAuth() // Integração com o Login

// Estados de Interface
const filtroDirecao = ref('TODOS') 
const modoVisualizacao = ref('GRID') 
const termoBusca = ref('') 

// --- UTILITÁRIOS ---
const formatarDataDia = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit' })
const formatarDataMes = (d: string) => new Date(d).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
const formatarDiaSemana = (d: string) => new Date(d).toLocaleDateString('pt-BR', { weekday: 'long' })
const getHoraVoo = (direcao: string) => direcao === 'IDA' ? '08:00' : '14:30' 
const getHoraChegada = (direcao: string) => direcao === 'IDA' ? '10:15' : '16:45'

// --- CÁLCULOS E CORES ---
const getPorcentagemOcupacao = (v: any) => (v.vagasOcupadas / v.vagasDisponiveis) * 100
const getStatusColor = (pct: number) => {
  if (pct >= 100) return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Esgotado', dot: 'bg-rose-500' }
  if (pct >= 80) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Últimas Vagas', dot: 'bg-amber-500' }
  return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Confirmado', dot: 'bg-emerald-500' }
}

// --- COMPUTED: Lógica de Filtragem ---
const vagasFiltradas = computed(() => {
  if (!vagas.value) return []
  return vagas.value.filter((v: any) => {
    const matchDirecao = filtroDirecao.value === 'TODOS' || v.direcao === filtroDirecao.value
    const texto = termoBusca.value.toLowerCase()
    const matchBusca = !texto || JSON.stringify(v).toLowerCase().includes(texto) || formatarDiaSemana(v.data).toLowerCase().includes(texto)
    return matchDirecao && matchBusca
  })
})

// Estatísticas
const stats = computed(() => {
  if (!vagas.value?.length) return { total: 0, ocupacao: 0 }
  const total = vagas.value.length
  const ocupacao = Math.round((vagas.value.reduce((acc: number, v: any) => acc + v.vagasOcupadas, 0) / vagas.value.reduce((acc: number, v: any) => acc + v.vagasDisponiveis, 0)) * 100)
  return { total, ocupacao }
})

// --- AÇÕES ---
const alternarBloqueio = async (vaga: any) => {
  if (!confirm(`Deseja ${vaga.bloqueado ? 'desbloquear' : 'bloquear'} este voo?`)) return

  try {
    await $fetch('/api/vagas/bloquear', {
      method: 'POST',
      body: { vagaId: vaga.id, bloqueado: !vaga.bloqueado }
    })
    refreshNuxtData() // Atualiza a lista
  } catch (error) {
    alert('Erro ao alterar bloqueio.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
    
    <aside class="w-20 lg:w-72 bg-[#0F172A] text-white flex flex-col fixed h-full z-50 shadow-2xl transition-all duration-300 border-r border-slate-800">
      <div class="h-24 flex items-center px-6 relative overflow-hidden">
        <div class="absolute top-0 left-10 w-20 h-20 bg-blue-500/20 blur-[40px] rounded-full pointer-events-none"></div>
        <div class="z-10 flex items-center gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span class="text-xl transform -rotate-12">✈️</span>
          </div>
          <div class="hidden lg:block">
            <h1 class="font-bold text-lg tracking-wider">SkyPass</h1>
            <p class="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">Corporativo</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <p class="hidden lg:block px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Principal</p>
        
        <NuxtLink to="/dashboard" class="flex items-center gap-4 px-4 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all group relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="material-icons relative z-10">dashboard</span>
          <span class="font-medium relative z-10 hidden lg:block">Visão Geral</span>
        </NuxtLink>

        <NuxtLink to="/solicitar" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">add_circle_outline</span>
          <span class="font-medium hidden lg:block">Nova Solicitação</span>
        </NuxtLink>
        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-emerald-400 transition-colors">history</span>
          <span class="font-medium hidden lg:block">Minhas Solicitações</span>
        </NuxtLink>
        
        <NuxtLink to="/aprovacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group border-t border-slate-700/50 mt-4">
          <span class="material-icons group-hover:text-indigo-400 transition-colors">gavel</span>
          <span class="font-medium hidden lg:block">Sala de Comando</span>
        </NuxtLink>

        <NuxtLink 
          v-if="['ADMIN', 'FINANCEIRO', 'MASTER'].includes(usuario?.perfil || '')"
          to="/relatorios" 
          class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <span class="material-icons group-hover:text-cyan-400 transition-colors">bar_chart</span>
          <span class="font-medium hidden lg:block">Relatórios</span>
        </NuxtLink>
      </nav>

      <div class="p-4 mt-auto border-t border-slate-800/50 bg-[#0B1120]">
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div class="hidden lg:block overflow-hidden">
            <p class="text-sm font-bold text-white truncate">{{ usuario?.nome || 'Visitante' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ usuario?.perfil || 'Sem Acesso' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px] relative">
      
      <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12 animate-slide-down">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Controle de Vagas</h2>
          <div class="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
            <span>Recife (REC)</span>
            <span class="text-slate-300">•----------•</span>
            <span>Noronha (FEN)</span>
          </div>
        </div>

        <div class="flex gap-4 w-full xl:w-auto bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <div class="relative group flex-1 xl:w-80">
            <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input 
              v-model="termoBusca"
              type="text" 
              placeholder="Pesquisar voo, data ou dia..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-700 placeholder-slate-400 transition-all"
            >
          </div>
          <div class="h-9 w-px bg-slate-200 mx-1"></div>
          <div class="flex gap-1">
            <button @click="modoVisualizacao = 'GRID'" :class="modoVisualizacao === 'GRID' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:bg-slate-100'" class="p-2 rounded-lg transition-all"><span class="material-icons">grid_view</span></button>
            <button @click="modoVisualizacao = 'LISTA'" :class="modoVisualizacao === 'LISTA' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:bg-slate-100'" class="p-2 rounded-lg transition-all"><span class="material-icons">view_list</span></button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span class="material-icons text-8xl">flight_takeoff</span>
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Voos no Período</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-4xl font-extrabold text-slate-800">{{ stats.total }}</h3>
            <span class="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ativos</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span class="material-icons text-8xl">analytics</span>
          </div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Taxa de Ocupação</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-4xl font-extrabold text-slate-800">{{ stats.ocupacao }}<span class="text-2xl">%</span></h3>
            <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Média</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" :style="{ width: `${stats.ocupacao}%` }"></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div class="relative z-10">
            <p class="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Ação Rápida</p>
            <h3 class="text-2xl font-bold mb-4">Precisa agendar um voo urgente?</h3>
            <NuxtLink to="/solicitar" class="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm">
              <span>Nova Solicitação</span>
              <span class="material-icons text-sm">arrow_forward</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <button 
          v-for="tab in ['TODOS', 'IDA', 'VOLTA']"
          @click="filtroDirecao = tab"
          class="px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
          :class="filtroDirecao === tab 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'"
        >
          {{ tab === 'TODOS' ? 'Todos' : tab === 'IDA' ? 'Ida (REC ➔ FEN)' : 'Volta (FEN ➔ REC)' }}
        </button>
      </div>

      <div v-if="!pending" class="min-h-[400px]">
        
        <TransitionGroup 
          v-if="modoVisualizacao === 'GRID'"
          tag="div" 
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          name="staggered-fade"
        >
          <div 
            v-for="(vaga, index) in vagasFiltradas" 
            :key="vaga.id"
            class="bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group flex flex-col relative overflow-hidden"
            :class="{ 'opacity-75 grayscale bg-slate-50': vaga.bloqueado }"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div v-if="vaga.bloqueado" class="absolute inset-0 z-10 bg-slate-100/50 pointer-events-none flex items-center justify-center">
               <span class="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12">BLOQUEADO</span>
            </div>

            <div v-if="usuario?.perfil === 'ADMIN'" class="absolute top-4 right-4 z-20">
               <button 
                 @click.stop="alternarBloqueio(vaga)"
                 class="p-2 rounded-full bg-white shadow-md hover:bg-slate-100 transition-colors"
                 :title="vaga.bloqueado ? 'Desbloquear' : 'Bloquear'"
               >
                 <span class="material-icons text-slate-400 text-sm">{{ vaga.bloqueado ? 'lock' : 'lock_open' }}</span>
               </button>
            </div>

            <div class="flex justify-between items-start mb-6">
              <div>
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border mb-2"
                  :class="vaga.direcao === 'IDA' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="vaga.direcao === 'IDA' ? 'bg-blue-500' : 'bg-emerald-500'"></span>
                  {{ vaga.direcao }}
                </span>
                <h4 class="text-slate-800 font-bold text-lg">{{ formatarDiaSemana(vaga.data) }}</h4>
                <p class="text-slate-500 text-sm">{{ formatarDataDia(vaga.data) }} de {{ formatarDataMes(vaga.data) }}</p>
              </div>
              <div class="text-right">
                 <div class="text-2xl font-extrabold text-slate-800">{{ getHoraVoo(vaga.direcao) }}</div>
                 <div class="text-xs text-slate-400 font-medium">Partida</div>
              </div>
            </div>

            <div class="relative h-12 mb-6 flex items-center justify-between px-2">
              <div class="text-xs font-bold text-slate-400 w-8">{{ vaga.direcao === 'IDA' ? 'REC' : 'FEN' }}</div>
              
              <div class="flex-1 mx-3 relative h-full flex items-center">
                <div class="w-full border-t-2 border-dashed border-slate-200"></div>
                <div class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 p-1 rounded-full text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                  <span class="material-icons text-sm transform rotate-90 inline-block">flight</span>
                </div>
              </div>
              
              <div class="text-xs font-bold text-slate-400 w-8 text-right">{{ vaga.direcao === 'IDA' ? 'FEN' : 'REC' }}</div>
            </div>

            <div class="mt-auto bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-bold text-slate-500">Assentos</span>
                <span 
                  class="text-xs font-bold px-2 py-0.5 rounded-md border"
                  :class="`${getStatusColor(getPorcentagemOcupacao(vaga)).bg} ${getStatusColor(getPorcentagemOcupacao(vaga)).text} ${getStatusColor(getPorcentagemOcupacao(vaga)).border}`"
                >
                  {{ getStatusColor(getPorcentagemOcupacao(vaga)).label }}
                </span>
              </div>
              
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div 
                  class="h-full rounded-full transition-all duration-500 relative"
                  :class="getStatusColor(getPorcentagemOcupacao(vaga)).dot"
                  :style="{ width: `${getPorcentagemOcupacao(vaga)}%` }"
                >
                </div>
              </div>

              <button
                v-if="vaga.bloqueado"
                disabled
                class="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-200 border border-slate-300 text-sm font-bold text-slate-400 cursor-not-allowed"
              >
                Bloqueado pelo Gestor
              </button>
              <NuxtLink 
                v-else
                :to="`/solicitar?vagaId=${vaga.id}`" 
                class="w-full flex items-center justify-center py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
              >
                Solicitar Reserva
              </NuxtLink>
            </div>
          </div>
        </TransitionGroup>

        <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
           <table class="w-full text-left">
             <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
               <tr>
                 <th class="p-5">Data / Rota</th>
                 <th class="p-5">Horário</th>
                 <th class="p-5 w-1/3">Status de Ocupação</th>
                 <th class="p-5 text-right">Ação</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-slate-100">
               <tr v-for="vaga in vagasFiltradas" :key="vaga.id" class="hover:bg-slate-50/80 transition-colors group">
                 <td class="p-5">
                   <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" :class="vaga.direcao === 'IDA' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'">
                       {{ vaga.direcao === 'IDA' ? '🛫' : '🛬' }}
                     </div>
                     <div>
                       <p class="font-bold text-slate-800">{{ formatarDataDia(vaga.data) }}/{{ formatarDataMes(vaga.data) }}</p>
                       <p class="text-xs text-slate-400 uppercase font-bold">{{ formatarDiaSemana(vaga.data) }}</p>
                     </div>
                   </div>
                 </td>
                 <td class="p-5">
                    <p class="font-mono text-sm font-bold text-slate-600">{{ getHoraVoo(vaga.direcao) }} <span class="text-slate-300 mx-1">→</span> {{ getHoraChegada(vaga.direcao) }}</p>
                    <p class="text-xs text-slate-400">Duração: 1h15m</p>
                 </td>
                 <td class="p-5">
                   <div class="flex items-center gap-3">
                     <div class="w-full max-w-[140px] bg-slate-100 h-2 rounded-full overflow-hidden">
                       <div class="h-full rounded-full" :class="getStatusColor(getPorcentagemOcupacao(vaga)).dot" :style="{ width: `${getPorcentagemOcupacao(vaga)}%` }"></div>
                     </div>
                     <span class="text-xs font-bold" :class="getStatusColor(getPorcentagemOcupacao(vaga)).text">{{ vaga.vagasDisponiveis - vaga.vagasOcupadas }} vagas</span>
                   </div>
                 </td>
                 <td class="p-5 text-right">
                   <NuxtLink :to="`/solicitar?vagaId=${vaga.id}`" class="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline decoration-2 underline-offset-4">
                     Gerenciar
                   </NuxtLink>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>
        
        <div v-if="vagasFiltradas.length === 0" class="py-20 text-center">
           <div class="inline-block p-4 rounded-full bg-slate-100 text-3xl mb-3">🌪️</div>
           <h3 class="text-lg font-bold text-slate-700">Nenhum voo encontrado</h3>
           <p class="text-slate-400 text-sm">Tente ajustar os filtros de busca.</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="bg-white h-[300px] rounded-3xl border border-slate-100 p-6 animate-pulse relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent -translate-x-full animate-shimmer"></div>
           <div class="flex justify-between mb-6">
             <div class="h-4 w-20 bg-slate-200 rounded"></div>
             <div class="h-8 w-16 bg-slate-200 rounded"></div>
           </div>
           <div class="h-4 w-full bg-slate-200 rounded mb-10"></div>
           <div class="mt-auto h-12 w-full bg-slate-200 rounded-xl"></div>
        </div>
      </div>

    </main>
  </div>
</template>

<style>
/* Importar Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Animações */
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.animate-slide-down {
  animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.staggered-fade-enter-active,
.staggered-fade-leave-active {
  transition: all 0.5s ease;
}
.staggered-fade-enter-from,
.staggered-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.staggered-fade-move {
  transition: transform 0.5s ease;
}
</style>