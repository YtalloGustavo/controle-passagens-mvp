<script setup lang="ts">
// --- DADOS ---
// Busca as solicitações do backend real
const { data: pedidos, pending, refresh } = await useFetch('/api/solicitacoes')
const { usuario } = useAuth() // Para mostrar o perfil na sidebar

// --- UTILITÁRIOS DE FORMATAÇÃO ---
const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR')
const formatarID = (id: number) => `#SOL-${String(id).padStart(3, '0')}`

// --- CORES E BADGES ---
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'APROVADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'NEGADO': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'ANALISE_GESTOR': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'ANALISE_PASSAGEM': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'ANALISE_HOSPEDAGEM': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'APROVACAO_ADMIN': return 'bg-amber-100 text-amber-700 border-amber-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getStatusLabel = (status: string) => {
  const labels: any = {
    'ANALISE_GESTOR': 'Análise Gestor',
    'ANALISE_PASSAGEM': 'Setor Passagens',
    'ANALISE_HOSPEDAGEM': 'Hospedagem',
    'APROVACAO_ADMIN': 'Diretoria',
    'APROVADO': 'Aprovado',
    'NEGADO': 'Recusado'
  }
  return labels[status] || status
}

// --- LÓGICA DA TIMELINE ---
// Gera os passos visuais baseados no status atual
const gerarTimeline = (statusAtual: string, dataCriacao: string) => {
  const etapas = [
    { id: 'CRIADO', label: 'Solicitação' },
    { id: 'ANALISE_GESTOR', label: 'Gestor' },
    { id: 'ANALISE_PASSAGEM', label: 'Passagens' },
    { id: 'APROVACAO_ADMIN', label: 'Diretoria' }, // Simplificado para caber visualmente
    { id: 'APROVADO', label: 'Conclusão' }
  ]

  // Mapeia onde estamos no processo
  let indexAtual = etapas.findIndex(e => e.id === statusAtual)
  
  // Ajustes manuais para etapas intermediárias
  if (statusAtual === 'ANALISE_HOSPEDAGEM') indexAtual = 2 // Considera junto com passagens visualmente
  
  const isNegado = statusAtual === 'NEGADO'

  return etapas.map((etapa, index) => {
    let statusCor = 'futuro' // Cinza (padrão)
    let dataDisplay = '-'

    // Regra 1: Se já passou desta etapa
    if (statusAtual === 'APROVADO' || (!isNegado && index <= indexAtual)) {
       statusCor = 'concluido'
       if (index === 0) dataDisplay = formatarData(dataCriacao)
    } 
    // Regra 2: Se é a etapa atual
    else if (!isNegado && etapa.id === statusAtual) {
       statusCor = 'pendente'
    }
    // Regra 3: Se foi recusado, a última etapa fica vermelha
    else if (isNegado && index === etapas.length - 1) {
       statusCor = 'negado'
    }

    return { label: etapa.label, status: statusCor, data: dataDisplay }
  })
}

// Cores das bolinhas da timeline
const getStepColor = (tipo: string) => {
  if (tipo === 'concluido') return 'bg-emerald-500 border-emerald-500 ring-4 ring-emerald-50'
  if (tipo === 'pendente') return 'bg-blue-500 border-blue-500 ring-4 ring-blue-50 animate-pulse'
  if (tipo === 'negado') return 'bg-rose-500 border-rose-500 ring-4 ring-rose-50'
  return 'bg-slate-200 border-slate-200'
}

// --- CRUD ---
const excluindoIds = ref(new Set<number>())
const modalAberto = ref(false)
const formEdicao = ref({
  id: 0,
  nomePassageiro: '',
  cpfPassageiro: '',
  dataNascimento: '',
  motivo: ''
})

const abrirEdicao = (pedido: any) => {
  formEdicao.value = {
    id: pedido.id,
    nomePassageiro: pedido.nomePassageiro,
    cpfPassageiro: pedido.cpfPassageiro,
    dataNascimento: pedido.dataNascimento ? pedido.dataNascimento.split('T')[0] : '',
    motivo: pedido.motivo
  }
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
}

const salvarEdicao = async () => {
  try {
    await $fetch('/api/solicitacoes', {
      method: 'PUT',
      body: formEdicao.value
    })
    alert('Solicitação atualizada!')
    modalAberto.value = false
    refresh()
  } catch (error: any) {
    alert('Erro ao atualizar: ' + (error.data?.statusMessage || error.message))
  }
}

const excluirSolicitacao = async (id: number) => {
  if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return

  excluindoIds.value.add(id)
  try {
    // Forçando a query string na URL para garantir que o ID chegue ao backend
    // params: { id } as vezes é ignorado em DELETE dependendo da versão do fetch/nuxt
    await $fetch(`/api/solicitacoes?id=${id}`, {
      method: 'DELETE'
    })
    alert('Solicitação cancelada!')
    refresh()
  } catch (error: any) {
    alert('Erro ao cancelar: ' + (error.data?.statusMessage || error.message))
  } finally {
    excluindoIds.value.delete(id)
  }
}
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

        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all group">
          <span class="material-icons">history</span>
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

        <NuxtLink 
          v-if="['GESTOR', 'ADMIN', 'MASTER'].includes(usuario?.perfil || '')"
          to="/gestor/colaboradores" 
          class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <span class="material-icons group-hover:text-amber-400 transition-colors">people</span>
          <span class="font-medium hidden lg:block">Minha Equipe</span>
        </NuxtLink>

        <NuxtLink 
          v-if="usuario?.perfil === 'MASTER'"
          to="/admin/vagas" 
          class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <span class="material-icons group-hover:text-rose-400 transition-colors">lock_clock</span>
          <span class="font-medium hidden lg:block">Gerenciar Vagas</span>
        </NuxtLink>

        <NuxtLink 
          v-if="['ADMIN', 'MASTER'].includes(usuario?.perfil || '')"
          to="/admin/usuarios" 
          class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
        >
          <span class="material-icons group-hover:text-slate-200 transition-colors">people_alt</span>
          <span class="font-medium hidden lg:block">Usuários</span>
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
      
      <header class="flex justify-between items-center mb-10 animate-slide-down">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Acompanhamento</h2>
          <p class="text-slate-500 mt-1">Gerencie o status dos seus pedidos de viagem.</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/solicitar" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95">
            <span class="material-icons text-sm">add</span> Nova Solicitação
          </NuxtLink>
          <button @click="() => refresh()" class="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all active:scale-95">
            <span class="material-icons text-sm">refresh</span> Atualizar
          </button>
        </div>
      </header>

      <div v-if="pending" class="text-center py-20">
        <div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-slate-400 mt-4 font-medium">Buscando solicitações...</p>
      </div>

      <div v-else class="space-y-6">
        
        <div v-if="pedidos?.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
           <span class="text-6xl">📭</span>
           <h3 class="text-xl font-bold text-slate-700 mt-4">Nenhuma solicitação encontrada</h3>
           <p class="text-slate-400 mb-6">Você ainda não criou nenhum pedido de viagem.</p>
           <NuxtLink to="/solicitar" class="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
             Criar Primeira Solicitação
           </NuxtLink>
        </div>

        <div 
          v-for="pedido in pedidos" 
          :key="pedido.id"
          class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 animate-fade-in group"
        >
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                📄
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800">{{ formatarID(pedido.id) }}</h3>
                <p class="text-sm text-slate-400">Criado em {{ formatarData(pedido.criadoEm) }}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 md:gap-10 w-full md:w-auto justify-between md:justify-end">
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passageiro</p>
                <p class="font-bold text-slate-700">{{ pedido.nomePassageiro }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voo</p>
                <p class="font-bold text-slate-700">
                  IDA: {{ formatarData(pedido.vaga.data) }}
                  <span v-if="pedido.vagaVolta" class="block text-purple-600">
                    VOLTA: {{ formatarData(pedido.vagaVolta.data) }}
                  </span>
                </p>
              </div>
              
              <div class="flex items-center gap-3">
                <span 
                  class="px-4 py-2 rounded-lg text-xs font-bold border uppercase tracking-wide flex items-center gap-2 shadow-sm"
                  :class="getStatusBadge(pedido.status)"
                >
                  <span class="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {{ getStatusLabel(pedido.status) }}
                </span>

                <!-- AÇÕES CRUD -->
                <div class="flex gap-2">
                  <!-- Editar: Apenas se estiver em análise inicial -->
                  <button v-if="pedido.status === 'ANALISE_GESTOR'" @click="abrirEdicao(pedido)" class="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors" title="Editar">
                    <span class="material-icons text-sm">edit</span>
                  </button>
                  
                  <!-- Excluir: Sempre disponível -->
                  <button 
                    @click="excluirSolicitacao(pedido.id)" 
                    :disabled="excluindoIds.has(pedido.id)"
                    class="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="Cancelar"
                  >
                    <span v-if="excluindoIds.has(pedido.id)" class="material-icons text-sm animate-spin">sync</span>
                    <span v-else class="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="relative pt-4 pb-4 px-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div class="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
            
            <div class="relative flex justify-between z-10">
              <div 
                v-for="(step, index) in gerarTimeline(pedido.status, pedido.criadoEm)" 
                :key="index"
                class="flex flex-col items-center relative group/step"
              >
                <div 
                  class="w-5 h-5 rounded-full border-2 bg-white transition-all duration-500 flex items-center justify-center"
                  :class="getStepColor(step.status)"
                >
                  <span v-if="step.status === 'concluido'" class="text-[8px] text-emerald-600 font-bold">✓</span>
                  <span v-if="step.status === 'negado'" class="text-[8px] text-rose-600 font-bold">✕</span>
                </div>
                
                <div class="absolute top-8 w-32 text-center transition-all duration-300">
                  <p 
                    class="text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors"
                    :class="step.status === 'futuro' ? 'text-slate-300' : 'text-slate-600'"
                  >
                    {{ step.label }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-medium" v-if="step.data !== '-'">{{ step.data }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="h-6"></div>

        </div>

      </div>

    </main>

    <!-- MODAL DE EDIÇÃO -->
    <div v-if="modalAberto" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="fecharModal"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-scale-up">
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-lg text-slate-800">Editar Solicitação</h3>
          <button @click="fecharModal" class="text-slate-400 hover:text-slate-600"><span class="material-icons">close</span></button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nome do Passageiro</label>
            <input v-model="formEdicao.nomePassageiro" type="text" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">CPF</label>
              <input v-model="formEdicao.cpfPassageiro" type="text" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Data Nascimento</label>
              <input v-model="formEdicao.dataNascimento" type="date" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Motivo da Viagem</label>
            <textarea v-model="formEdicao.motivo" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
        </div>

        <div class="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button @click="fecharModal" class="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="salvarEdicao" class="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
/* Importar Ícones */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Animações Personalizadas */
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

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>