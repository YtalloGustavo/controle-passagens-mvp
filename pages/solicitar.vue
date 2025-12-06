<script setup lang="ts">
// --- ESTADO ---
const { usuario } = useAuth()
const router = useRouter()

// Controle de Tipo de Viagem
const tipoViagem = ref<'IDA' | 'IDA_VOLTA'>('IDA')

// Vagas
const dataViagem = ref('')
const dataVolta = ref('') // Nova data para volta
const vagasDisponiveis = ref<any[]>([])
const vagasVoltaDisponiveis = ref<any[]>([]) // Vagas para volta
const vagaSelecionada = ref<number | null>(null)
const vagaVoltaSelecionada = ref<number | null>(null) // ID da vaga de volta

// Colaborador
const colaboradores = ref<any[]>([])
const colaboradorSelecionado = ref<number | null>(null)

// Formulário
const form = ref({
  nome: '',
  cpf: '',
  dataNascimento: '',
  setor: usuario.value?.setor || '',
  motivo: ''
})

const carregando = ref(false)
const erro = ref('')

// --- BUSCAS ---
// Busca colaboradores do gestor
const carregarColaboradores = async () => {
  if (['GESTOR', 'ADMIN', 'MASTER'].includes(usuario.value?.perfil || '')) {
    const { data } = await useFetch('/api/colaboradores')
    colaboradores.value = data.value || []
  }
}

// Busca vagas de IDA
const buscarVagas = async () => {
  if (!dataViagem.value) return
  
  const { data } = await useFetch('/api/vagas/disponibilidade', {
    query: { data: dataViagem.value, direcao: 'IDA' }
  })
  
  // Filtra apenas vagas não bloqueadas e com disponibilidade
  vagasDisponiveis.value = (data.value as any[] || []).filter(v => !v.bloqueado && v.vagasDisponiveis > v.vagasOcupadas)
}

// Busca vagas de VOLTA
const buscarVagasVolta = async () => {
  if (!dataVolta.value) return
  
  const { data } = await useFetch('/api/vagas/disponibilidade', {
    query: { data: dataVolta.value, direcao: 'VOLTA' }
  })
  
  vagasVoltaDisponiveis.value = (data.value as any[] || []).filter(v => !v.bloqueado && v.vagasDisponiveis > v.vagasOcupadas)
}

// Preenche dados ao selecionar colaborador
watch(colaboradorSelecionado, (novoId) => {
  if (novoId) {
    const colab = colaboradores.value.find(c => c.id === novoId)
    if (colab) {
      form.value.nome = colab.nome
      form.value.cpf = colab.cpf
      form.value.dataNascimento = colab.dataNascimento.split('T')[0]
    }
  } else {
    // Limpa se desmarcar (opcional)
  }
})

// Monitora datas para buscar vagas
watch(dataViagem, buscarVagas)
watch(dataVolta, buscarVagasVolta)

// --- AÇÕES ---
const enviarSolicitacao = async () => {
  erro.value = ''
  
  if (!vagaSelecionada.value) {
    erro.value = 'Selecione um voo de ida.'
    return
  }

  if (tipoViagem.value === 'IDA_VOLTA' && !vagaVoltaSelecionada.value) {
    erro.value = 'Selecione um voo de volta.'
    return
  }

  carregando.value = true

  try {
    await $fetch('/api/solicitacoes', {
      method: 'POST',
      body: {
        ...form.value,
        vagaId: vagaSelecionada.value,
        vagaVoltaId: tipoViagem.value === 'IDA_VOLTA' ? vagaVoltaSelecionada.value : null
      }
    })
    
    alert('Solicitação enviada com sucesso!')
    router.push('/minhas-solicitacoes')
  } catch (e: any) {
    erro.value = e.data?.statusMessage || 'Erro ao enviar solicitação.'
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarColaboradores()
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] flex font-sans text-slate-800">
    
    <!-- Sidebar (Simplificada para brevidade, idealmente um componente) -->
    <aside class="w-20 lg:w-72 bg-[#0F172A] text-white flex flex-col fixed h-full z-50 shadow-2xl border-r border-slate-800">
       <!-- ... (Sidebar content kept same as dashboard/others) ... -->
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

        <NuxtLink to="/solicitar" class="flex items-center gap-4 px-4 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all group">
          <span class="material-icons">add_circle_outline</span>
          <span class="font-medium hidden lg:block">Nova Solicitação</span>
        </NuxtLink>

        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">history</span>
          <span class="font-medium hidden lg:block">Minhas Solicitações</span>
        </NuxtLink>
        
        <!-- Outros links... -->
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
          <img :src="`https://ui-avatars.com/api/?name=${usuario?.nome || 'User'}&background=3b82f6&color=fff`" class="w-9 h-9 rounded-full ring-2 ring-slate-700" alt="User">
          <div class="hidden lg:block overflow-hidden">
            <p class="text-sm font-bold text-white truncate">{{ usuario?.nome || 'Visitante' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ usuario?.perfil || 'Sem Acesso' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px] relative">
      
      <header class="mb-10 animate-slide-down">
        <h2 class="text-3xl font-extrabold text-slate-900">Nova Solicitação</h2>
        <p class="text-slate-500 mt-1">Preencha os dados para solicitar uma viagem.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Coluna 1: Dados do Passageiro -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Seleção de Colaborador (Se Gestor) -->
          <div v-if="colaboradores.length > 0" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <span class="material-icons text-blue-500">people</span> Selecionar Colaborador
            </h3>
            <select v-model="colaboradorSelecionado" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
              <option :value="null">-- Preencher Manualmente --</option>
              <option v-for="c in colaboradores" :key="c.id" :value="c.id">
                {{ c.nome }} (CPF: {{ c.cpf }})
              </option>
            </select>
          </div>

          <!-- Formulário Principal -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-fade-in">
            <h3 class="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-500">person</span> Dados do Passageiro
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: João Silva">
              </div>
              
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">CPF</label>
                <input v-model="form.cpf" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="000.000.000-00">
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento</label>
                <input v-model="form.dataNascimento" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Setor</label>
                <select v-model="form.setor" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  <option value="" disabled>Selecione um setor</option>
                  <option value="TI">TI</option>
                  <option value="RH">RH</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Logística">Logística</option>
                  <option value="Jurídico">Jurídico</option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-bold text-slate-700 mb-2">Motivo da Viagem</label>
              <textarea v-model="form.motivo" rows="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Descreva o motivo da solicitação..."></textarea>
            </div>
          </div>

        </div>

        <!-- Coluna 2: Seleção de Voo -->
        <div class="space-y-6">
          
          <!-- Tipo de Viagem -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h3 class="font-bold text-lg text-slate-800 mb-4">Tipo de Viagem</h3>
             <div class="flex bg-slate-100 p-1 rounded-xl">
               <button 
                 @click="tipoViagem = 'IDA'"
                 class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                 :class="tipoViagem === 'IDA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
               >
                 Somente Ida
               </button>
               <button 
                 @click="tipoViagem = 'IDA_VOLTA'"
                 class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                 :class="tipoViagem === 'IDA_VOLTA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
               >
                 Ida e Volta
               </button>
             </div>
          </div>

          <!-- Seleção de Voo IDA -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <span class="material-icons text-emerald-500">flight_takeoff</span> Voo de Ida
            </h3>
            
            <div class="mb-4">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data da Viagem</label>
              <input v-model="dataViagem" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>

            <div v-if="vagasDisponiveis.length > 0" class="space-y-3">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Voos Disponíveis</p>
              <div 
                v-for="vaga in vagasDisponiveis" 
                :key="vaga.id"
                @click="vagaSelecionada = vaga.id"
                class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
                :class="vagaSelecionada === vaga.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'"
              >
                <div class="flex justify-between items-center">
                  <span class="font-bold text-slate-700">{{ new Date(vaga.data).toLocaleDateString('pt-BR') }}</span>
                  <span class="text-xs font-bold px-2 py-1 bg-white rounded-lg text-emerald-600 shadow-sm">
                    {{ vaga.vagasDisponiveis - vaga.vagasOcupadas }} vagas
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Saída: Recife (REC)</p>
              </div>
            </div>
            
            <div v-else-if="dataViagem" class="text-center py-8 text-slate-400">
              <span class="material-icons text-3xl mb-2">sentiment_dissatisfied</span>
              <p class="text-sm">Nenhum voo disponível nesta data.</p>
            </div>
          </div>

          <!-- Seleção de Voo VOLTA (Condicional) -->
          <div v-if="tipoViagem === 'IDA_VOLTA'" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-fade-in">
            <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <span class="material-icons text-purple-500">flight_land</span> Voo de Volta
            </h3>
            
            <div class="mb-4">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data da Volta</label>
              <input v-model="dataVolta" type="date" :min="dataViagem" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none">
            </div>

            <div v-if="vagasVoltaDisponiveis.length > 0" class="space-y-3">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Voos Disponíveis</p>
              <div 
                v-for="vaga in vagasVoltaDisponiveis" 
                :key="vaga.id"
                @click="vagaVoltaSelecionada = vaga.id"
                class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
                :class="vagaVoltaSelecionada === vaga.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'"
              >
                <div class="flex justify-between items-center">
                  <span class="font-bold text-slate-700">{{ new Date(vaga.data).toLocaleDateString('pt-BR') }}</span>
                  <span class="text-xs font-bold px-2 py-1 bg-white rounded-lg text-purple-600 shadow-sm">
                    {{ vaga.vagasDisponiveis - vaga.vagasOcupadas }} vagas
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Saída: Noronha (FEN)</p>
              </div>
            </div>
            
            <div v-else-if="dataVolta" class="text-center py-8 text-slate-400">
              <span class="material-icons text-3xl mb-2">sentiment_dissatisfied</span>
              <p class="text-sm">Nenhum voo disponível nesta data.</p>
            </div>
          </div>

          <!-- Botão de Envio -->
          <button 
            @click="enviarSolicitacao"
            :disabled="carregando"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transform transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="carregando" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span v-else>Confirmar Solicitação</span>
            <span v-if="!carregando" class="material-icons">arrow_forward</span>
          </button>

          <div v-if="erro" class="bg-rose-100 text-rose-600 p-4 rounded-xl text-sm font-bold text-center animate-shake">
            {{ erro }}
          </div>

        </div>

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
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>