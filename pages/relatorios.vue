<script setup lang="ts">
interface Usuario {
  nome: string;
  perfil: string;
}

interface RelatorioResponse {
  kpis: {
    taxaOcupacao: number;
    totalSolicitacoes: number;
    custoTotal: number;
    passagensEmitidas: number;
  };
  graficos: {
    porSetor: { setor: string; quantidade: number }[];
    porStatus: { status: string; quantidade: number }[];
  };
  tabela: {
    id: number;
    passageiro: string;
    setor: string;
    destino: string;
    dataVoo: string;
    aprovador: string;
    dataAprovacao: string;
  }[];
}

const { usuario } = useAuth() as { usuario: Ref<Usuario | null> }
const router = useRouter()

// Segurança: Apenas Admin, Financeiro e Master
onMounted(() => {
  if (!['ADMIN', 'FINANCEIRO', 'MASTER'].includes(usuario.value?.perfil || '')) {
    router.push('/dashboard')
  }
})

const dataInicio = ref('')
const dataFim = ref('')

const { data: relatorio, pending, refresh } = await useFetch<RelatorioResponse>('/api/relatorios/geral', {
  query: {
    dataInicio,
    dataFim
  }
})

// Utilitários de Formatação
const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
const formatData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800">
    
    <!-- Sidebar (Cópia do Dashboard com link ativo) -->
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
        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">history</span>
          <span class="font-medium hidden lg:block">Minhas Solicitações</span>
        </NuxtLink>

        <NuxtLink to="/aprovacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group border-t border-slate-700/50 mt-4">
          <span class="material-icons group-hover:text-indigo-400 transition-colors">gavel</span>
          <span class="font-medium hidden lg:block">Sala de Comando</span>
        </NuxtLink>

        <NuxtLink to="/relatorios" class="flex items-center gap-4 px-4 py-3.5 bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-900/50 transition-all group">
          <span class="material-icons">bar_chart</span>
          <span class="font-medium hidden lg:block">Relatórios</span>
        </NuxtLink>
      </nav>

      <div class="p-4 mt-auto border-t border-slate-800/50 bg-[#0B1120]">
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <img :src="`https://ui-avatars.com/api/?name=${usuario?.nome || 'User'}&background=3b82f6&color=fff`" class="w-9 h-9 rounded-full ring-2 ring-slate-700" alt="User">
          <div class="hidden lg:block overflow-hidden">
            <p class="text-sm font-bold text-white truncate">{{ usuario?.nome || 'Visitante' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ usuario?.perfil || 'Sem Acesso' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px] relative">
      
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-slide-down">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Relatórios Gerenciais</h2>
          <p class="text-slate-500 mt-1">Métricas consolidadas e indicadores de performance.</p>
        </div>
        <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <input type="date" v-model="dataInicio" class="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500">
           <span class="text-slate-400 text-xs">até</span>
           <input type="date" v-model="dataFim" class="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500">
           <button @click="refresh()" class="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors">
             <span class="material-icons text-sm">filter_list</span>
           </button>
        </div>
      </header>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>

      <div v-else class="grid gap-8">
        
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div class="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <span class="material-icons text-8xl">payments</span>
            </div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gasto Estimado</p>
            <h3 class="text-4xl font-extrabold text-slate-800">{{ formatMoney(relatorio.kpis.custoTotal) }}</h3>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div class="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <span class="material-icons text-8xl">confirmation_number</span>
            </div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Passagens Emitidas</p>
            <h3 class="text-4xl font-extrabold text-slate-800">{{ relatorio.kpis.passagensEmitidas }}</h3>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div class="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <span class="material-icons text-8xl">pie_chart</span>
            </div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Ocupação Global</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-4xl font-extrabold text-slate-800">{{ relatorio.kpis.taxaOcupacao }}<span class="text-2xl">%</span></h3>
            </div>
            <div class="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${relatorio.kpis.taxaOcupacao}%` }"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Gráfico por Setor -->
          <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 class="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-500">domain</span>
              Solicitações por Setor
            </h3>
            <div class="space-y-5">
              <div v-for="(item, index) in relatorio.graficos.porSetor" :key="item.setor">
                <div class="flex justify-between text-sm font-bold mb-1">
                  <span class="text-slate-600">{{ item.setor }}</span>
                  <span class="text-slate-800">{{ item.quantidade }}</span>
                </div>
                <div class="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-1000"
                    :class="['bg-blue-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-sky-500'][index % 4]"
                    :style="{ width: `${(item.quantidade / relatorio.kpis.totalSolicitacoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráfico por Status -->
          <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 class="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-purple-500">donut_large</span>
              Status das Solicitações
            </h3>
            <div class="space-y-5">
              <div v-for="item in relatorio.graficos.porStatus" :key="item.status">
                <div class="flex justify-between text-sm font-bold mb-1">
                  <span class="text-slate-600 capitalize">{{ item.status.replace('_', ' ').toLowerCase() }}</span>
                  <span class="text-slate-800">{{ item.quantidade }}</span>
                </div>
                <div class="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-1000"
                    :class="{
                      'bg-emerald-500': item.status === 'APROVADO',
                      'bg-rose-500': item.status === 'NEGADO',
                      'bg-amber-500': item.status.includes('ANALISE')
                    }"
                    :style="{ width: `${(item.quantidade / relatorio.kpis.totalSolicitacoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Tabela de Últimas Aprovações -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span class="material-icons text-emerald-500">check_circle</span>
              Últimas Aprovações Financeiras
            </h3>
          </div>
          <table class="w-full text-left">
             <thead class="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
               <tr>
                 <th class="p-5 pl-8">Passageiro</th>
                 <th class="p-5">Voo</th>
                 <th class="p-5">Aprovado Por</th>
                 <th class="p-5 text-right pr-8">Data</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-slate-100">
               <tr v-for="item in relatorio.tabela" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
                 <td class="p-5 pl-8">
                   <p class="font-bold text-slate-800">{{ item.passageiro }}</p>
                   <p class="text-xs text-slate-400 font-bold">{{ item.setor }}</p>
                 </td>
                 <td class="p-5">
                   <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                     {{ item.destino }}
                   </span>
                   <span class="text-xs text-slate-500 ml-2">{{ new Date(item.dataVoo).toLocaleDateString() }}</span>
                 </td>
                 <td class="p-5 text-sm font-medium text-slate-600">
                   {{ item.aprovador }}
                 </td>
                 <td class="p-5 text-right pr-8 text-xs font-bold text-slate-400">
                   {{ formatData(item.dataAprovacao) }}
                 </td>
               </tr>
             </tbody>
          </table>
        </div>

      </div>

    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.animate-slide-down {
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
