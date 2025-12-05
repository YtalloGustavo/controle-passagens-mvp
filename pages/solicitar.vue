<script setup lang="ts">
const route = useRoute() // Para pegar o ID da URL
const { usuario } = useAuth()

// --- ESTADOS ---
const step = ref(1)
const loading = ref(false)
const erroMsg = ref('')

// --- DADOS FORM ---
const form = reactive({
  nome: '',
  cpf: '',
  dataNascimento: '',
  setor: '',
  motivo: ''
})

// --- DADOS DO VOO (Dinâmico) ---
// Tenta pegar o ID da URL, se não tiver usa o 1 como fallback
const vagaId = computed(() => route.query.vagaId || 1)

// Buscamos os dados reais dessa vaga na API para mostrar no bilhete
const { data: vagaInfo } = await useFetch(`/api/vagas`)
const voo = computed(() => {
  // Encontra a vaga específica na lista ou retorna um mock se não achar
  const v = vagaInfo.value?.find((item: any) => item.id == vagaId.value)
  if (v) {
    return {
      codigo: `FN-${100 + v.id}`,
      data: new Date(v.data),
      origem: v.direcao === 'IDA' ? 'REC' : 'FEN',
      destino: v.direcao === 'IDA' ? 'FEN' : 'REC',
      partida: v.direcao === 'IDA' ? '08:00' : '14:30',
      chegada: v.direcao === 'IDA' ? '10:15' : '16:45',
      duracao: '1h 15m'
    }
  }
  return { codigo: 'FN-000', data: new Date(), origem: '-', destino: '-', partida: '-', chegada: '-', duracao: '-' }
})

// --- NAVEGAÇÃO ---
const avancar = () => {
  if (step.value === 2) {
    if (!form.nome || !form.cpf || !form.dataNascimento) return alert('Preencha os dados do passageiro.')
  }
  step.value++
}

const voltar = () => {
  if (step.value > 1) step.value--
  else navigateTo('/dashboard')
}

// --- AÇÃO PRINCIPAL: ENVIAR PARA A API ---
const enviar = async () => {
  if (!form.setor || !form.motivo) return alert('Preencha todos os campos.')
  
  loading.value = true
  erroMsg.value = ''

  try {
    // CHAMA O NOSSO BACKEND NOVO
    const res = await $fetch('/api/solicitacoes', {
      method: 'POST',
      body: {
        vagaId: Number(vagaId.value),
        nome: form.nome,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        setor: form.setor,
        motivo: form.motivo
      }
    })

    // Sucesso!
    step.value = 4
  } catch (error: any) {
    console.error(error)
    erroMsg.value = error.statusMessage || 'Erro ao processar solicitação.'
    alert(erroMsg.value)
  } finally {
    loading.value = false
  }
}

// --- UTILITÁRIOS ---
const steps = ['Voo', 'Passageiro', 'Motivo', 'Conclusão']
const formatData = (d: Date) => d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '-'
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

        <NuxtLink to="/solicitar" class="flex items-center gap-4 px-4 py-3.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/50 transition-all group">
          <span class="material-icons">add_circle_outline</span>
          <span class="font-medium hidden lg:block">Nova Solicitação</span>
        </NuxtLink>

        <NuxtLink to="/minhas-solicitacoes" class="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
          <span class="material-icons group-hover:text-blue-400 transition-colors">history</span>
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
          <img :src="`https://ui-avatars.com/api/?name=${usuario?.nome || 'User'}&background=3b82f6&color=fff`" class="w-9 h-9 rounded-full ring-2 ring-slate-700" alt="User">
          <div class="hidden lg:block overflow-hidden">
            <p class="text-sm font-bold text-white truncate">{{ usuario?.nome || 'Visitante' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ usuario?.perfil || 'Sem Acesso' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 ml-20 lg:ml-72 p-6 lg:p-10 max-w-[1920px] relative flex items-center justify-center">
      
      <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div class="bg-slate-50 border-b border-slate-100 p-6">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-xl font-bold text-slate-800">Nova Solicitação</h1>
            <button @click="voltar" class="text-sm text-slate-500 hover:text-slate-800 font-medium">
              {{ step === 1 ? 'Cancelar' : 'Voltar' }}
            </button>
          </div>

          <div class="relative flex justify-between items-center">
            <div class="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-0"></div>
            <div v-for="(label, index) in steps" :key="index" class="relative z-10 flex flex-col items-center bg-slate-50 px-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2"
                :class="(index + 1) <= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'">
                {{ (index + 1) < step ? '✓' : index + 1 }}
              </div>
              <span class="text-[10px] font-bold uppercase mt-2 tracking-wider transition-colors duration-300"
                :class="(index + 1) <= step ? 'text-blue-600' : 'text-slate-400'">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="p-8">
          <Transition name="fade" mode="out-in">
            
            <!-- STEP 1: VOO -->
            <div v-if="step === 1" class="space-y-6">
              <div class="text-center">
                <h2 class="text-2xl font-bold text-slate-800">Confirme o voo selecionado</h2>
                <p class="text-slate-500 text-sm mt-1">Verifique os detalhes antes de prosseguir.</p>
              </div>

              <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Voo {{ voo.codigo }}</span>
                  <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{{ formatData(voo.data) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-slate-800">{{ voo.origem }}</p>
                    <p class="text-sm text-slate-500">{{ voo.partida }}</p>
                  </div>
                  <div class="flex-1 px-4 flex flex-col items-center">
                    <span class="text-xs text-slate-400 font-medium mb-1">{{ voo.duracao }}</span>
                    <div class="w-full h-0.5 bg-slate-300 relative">
                      <div class="absolute w-2 h-2 bg-slate-300 rounded-full left-0 -top-[3px]"></div>
                      <div class="absolute w-2 h-2 bg-slate-300 rounded-full right-0 -top-[3px]"></div>
                      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-2 text-slate-400">✈</div>
                    </div>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-slate-800">{{ voo.destino }}</p>
                    <p class="text-sm text-slate-500">{{ voo.chegada }}</p>
                  </div>
                </div>
              </div>

              <button @click="avancar" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                Continuar
              </button>
            </div>

            <!-- STEP 2: PASSAGEIRO -->
            <div v-else-if="step === 2" class="space-y-6">
              <div class="text-center">
                <h2 class="text-2xl font-bold text-slate-800">Dados do Passageiro</h2>
                <p class="text-slate-500 text-sm mt-1">Informe quem irá viajar.</p>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nome Completo</label>
                  <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" placeholder="Ex: João Silva">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">CPF</label>
                    <input v-model="form.cpf" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium" placeholder="000.000.000-00">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Data de Nascimento</label>
                    <input v-model="form.dataNascimento" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium text-slate-600">
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button @click="voltar" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all">
                  Voltar
                </button>
                <button @click="avancar" class="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                  Continuar
                </button>
              </div>
            </div>

            <!-- STEP 3: MOTIVO -->
            <div v-else-if="step === 3" class="space-y-6">
              <div class="text-center">
                <h2 class="text-2xl font-bold text-slate-800">Detalhes da Solicitação</h2>
                <p class="text-slate-500 text-sm mt-1">Justifique a necessidade da viagem.</p>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Departamento</label>
                  <div class="relative">
                    <select v-model="form.setor" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white appearance-none focus:border-blue-500 outline-none transition-all font-medium text-slate-600">
                      <option value="" disabled selected>Selecione o setor...</option>
                      <option value="TI">Tecnologia</option>
                      <option value="RH">RH</option>
                      <option value="FIN">Financeiro</option>
                      <option value="COM">Comercial</option>
                      <option value="OPS">Operações</option>
                    </select>
                    <div class="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Motivo da Viagem</label>
                  <textarea v-model="form.motivo" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none font-medium" placeholder="Descreva detalhadamente o motivo..."></textarea>
                </div>
              </div>

              <div class="flex gap-3">
                <button @click="voltar" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all">
                  Voltar
                </button>
                <button @click="enviar" :disabled="loading" class="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <span v-if="loading" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  <span v-else>Finalizar Solicitação</span>
                </button>
              </div>
              <p v-if="erroMsg" class="text-center text-red-500 text-sm font-bold">{{ erroMsg }}</p>
            </div>

            <!-- STEP 4: SUCESSO -->
            <div v-else class="text-center py-8">
              <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">✓</div>
              <h2 class="text-3xl font-bold text-slate-800 mb-2">Sucesso!</h2>
              <p class="text-slate-500 mb-8 max-w-md mx-auto">Sua solicitação foi salva no banco de dados e a vaga foi reservada.</p>
              <div class="space-y-3">
                <NuxtLink to="/dashboard" class="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">Voltar ao Dashboard</NuxtLink>
                <NuxtLink to="/minhas-solicitacoes" class="block w-full text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-50">Ver Meus Pedidos</NuxtLink>
              </div>
            </div>

          </Transition>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>