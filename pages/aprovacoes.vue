<script setup lang="ts">
// --- INTERFACES ---
interface Solicitacao {
  id: number
  status: string
  criadoEm: string | Date
  nomePassageiro: string
  setor: string
  motivo: string
  vaga: {
    direcao: string
    data: string | Date
  }
  infoHospedagem?: string
}

// --- DADOS ---
const { data: solicitacoes, refresh } = await useFetch<Solicitacao[]>('/api/solicitacoes')
const { usuario } = useAuth() // Apenas para referência visual se necessário

// --- ESTADOS ---
const processando = ref<number | null>(null)

// --- SIMULADOR DE PERFIL (Dinâmico) ---
const { data: usuariosDb } = await useFetch('/api/usuarios')
const perfis = computed(() => usuariosDb.value || [])
const perfilAtual = ref(perfis.value?.[0]?.id || 0) 

// Watch para garantir que seleciona o primeiro quando carregar
watch(perfis, (novos) => {
  if (novos && novos.length > 0 && !perfilAtual.value) {
    perfilAtual.value = novos[0]?.id || 0
  }
}, { immediate: true })

// Estado para o formulário de hospedagem
const formHospedagem = reactive({ tipo: 'CASA_FUNCIONAL', info: '' })

// --- LÓGICA DE FILTRAGEM (Quem vê o quê) ---
const pendencias = computed(() => {
  if (!solicitacoes.value) return []
  
  const cargoSelecionado = perfis.value.find((p: any) => p.id === perfilAtual.value)?.perfil

  return solicitacoes.value.filter((s) => {
    // 1. Gestor vê novos
    if (cargoSelecionado === 'GESTOR' && s.status === 'ANALISE_GESTOR') return true
    
    // 2. Passagens vê aprovados pelo Gestor
    if (cargoSelecionado === 'PASSAGEM' && s.status === 'ANALISE_PASSAGEM') return true
    
    // 3. Hospedagem vê aprovados pela Passagem
    if (cargoSelecionado === 'HOSPEDAGEM' && s.status === 'ANALISE_HOSPEDAGEM') return true
    
    // 4. Admin vê aprovados pela Hospedagem
    if (cargoSelecionado === 'ADMIN' && s.status === 'APROVACAO_ADMIN') return true
    
    // 5. Financeiro vê aprovados pelo Admin (Fase Final)
    if (cargoSelecionado === 'FINANCEIRO' && s.status === 'ANALISE_FINANCEIRO') return true
    
    return false
  })
})

// --- AÇÃO DE APROVAR/NEGAR ---
const processar = async (id: number, acao: 'APROVAR' | 'NEGAR') => {
  const cargo = perfis.value.find((p: any) => p.id === perfilAtual.value)?.perfil
  let detalhesHospedagem = null

  // Se for a Mariana (Hospedagem) a aprovar, precisamos saber ONDE o funcionário fica
  if (acao === 'APROVAR' && cargo === 'HOSPEDAGEM') {
    const info = prompt('Informe os detalhes da hospedagem (Ex: Casa Funcional 01 ou Hotel X):', 'Casa Funcional')
    if (!info) return // Cancela se não preencher
    detalhesHospedagem = { tipo: 'DEFINIDO_PELO_GERENTE', info: info }
  } 
  // Confirmação padrão para os outros
  else if (!confirm(`Tem certeza que deseja ${acao === 'APROVAR' ? 'Aprovar' : 'Rejeitar'} esta solicitação?`)) {
    return
  }

  processando.value = id
  try {
    // Chama a API
    await $fetch('/api/solicitacoes/aprovar', {
      method: 'POST',
      body: {
        solicitacaoId: id,
        usuarioId: perfilAtual.value, // Simula o usuário logado
        acao: acao,
        detalhesHospedagem // Envia dados da casa/hotel se houver
      }
    })
    
    await refresh() // Atualiza a lista
    
  } catch (error: any) {
    alert('Erro: ' + (error.data?.statusMessage || 'Falha ao processar.'))
  } finally {
    processando.value = null
  }
}

// Utilitário
const formatData = (d: string | Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800">
    
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
          <span class="material-icons group-hover:text-emerald-400 transition-colors">add_circle_outline</span>
          <span class="font-medium hidden lg:block">Nova Solicitação</span>
        </NuxtLink>

        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">history</span>
          <span class="font-medium hidden lg:block">Minhas Solicitações</span>
        </NuxtLink>

        <NuxtLink to="/aprovacoes" class="flex items-center gap-4 px-4 py-3.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-900/50 transition-all group border-t border-slate-700/50 mt-4">
          <span class="material-icons">gavel</span>
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
          <h2 class="text-3xl font-extrabold text-slate-900">Sala de Comando</h2>
          <p class="text-slate-500 mt-1">Central de aprovações e gestão de pendências.</p>
        </div>

        <div class="bg-white p-1.5 pl-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil Ativo:</span>
          <div class="relative">
            <select 
              v-model="perfilAtual" 
              class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl appearance-none outline-none cursor-pointer transition-colors border-r-8 border-transparent"
            >
              <option v-for="p in perfis" :key="p.id" :value="p.id">{{ p.nome }} ({{ p.perfil }})</option>
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
          </div>
        </div>
      </header>

      <div v-if="pendencias.length > 0" class="grid gap-4">
        
        <div 
          v-for="pedido in pendencias" 
          :key="pedido.id"
          class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all animate-fade-in flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div class="flex items-center gap-5 w-full lg:w-auto">
            <div class="flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
              <span class="text-[10px] font-bold uppercase">{{ pedido.vaga.direcao }}</span>
              <span class="text-xl font-bold">{{ new Date(pedido.vaga.data).getDate() }}</span>
              <span class="text-[9px] font-medium uppercase opacity-70">{{ formatData(pedido.vaga.data).split('/')[1] }}</span>
            </div>

            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-lg text-slate-800">{{ pedido.nomePassageiro }}</h3>
                <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md tracking-wide">
                  {{ pedido.setor }}
                </span>
              </div>
              <p class="text-sm text-slate-500 line-clamp-1">
                <span class="font-medium text-slate-400">Motivo:</span> "{{ pedido.motivo }}"
              </p>
              
              <div class="flex items-center gap-2 mt-2 text-xs font-medium text-indigo-600">
                <span class="material-icons text-[14px]">schedule</span>
                <span>Aguardando {{ perfis.find((p: any) => p.id === perfilAtual)?.perfil }}</span>
              </div>

              <div v-if="pedido.infoHospedagem" class="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">
                <span class="material-icons text-[12px]">home</span>
                {{ pedido.infoHospedagem }}
              </div>
            </div>
          </div>

          <div class="flex gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-0 border-slate-100">
            <button 
              @click="processar(pedido.id, 'NEGAR')"
              :disabled="processando === pedido.id"
              class="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm disabled:opacity-50"
            >
              Recusar
            </button>
            <button 
              @click="processar(pedido.id, 'APROVAR')"
              :disabled="processando === pedido.id"
              class="flex-1 lg:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
            >
              <span v-if="processando === pedido.id" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span v-else>
                {{ perfis.find((p: any) => p.id === perfilAtual)?.perfil === 'HOSPEDAGEM' ? 'Definir & Aprovar' : 'Aprovar' }}
              </span>
            </button>
          </div>
        </div>

      </div>

      <div v-else class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">👍</div>
        <h3 class="text-xl font-bold text-slate-800">Tudo limpo por aqui!</h3>
        <p class="text-slate-400 mt-1 max-w-xs text-center">Não existem solicitações pendentes para o perfil <span class="font-bold text-slate-600">{{ perfis.find((p: any) => p.id === perfilAtual)?.nome }}</span>.</p>
      </div>

    </main>
  </div>
</template>

<style>
/* Importar Ícones */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.animate-slide-down {
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.99); }
  to { opacity: 1; transform: scale(1); }
}
</style>