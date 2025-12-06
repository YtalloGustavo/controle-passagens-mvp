<script setup lang="ts">
interface Usuario {
  id: number
  nome: string
  email: string
  perfil: string
  setor: string | null
}

const { usuario } = useAuth()
const router = useRouter()

// Segurança: Apenas ADMIN e MASTER
onMounted(() => {
  if (!['ADMIN', 'MASTER'].includes(usuario.value?.perfil || '')) {
    router.push('/dashboard')
  }
})

const { data: usuarios, pending, refresh } = await useFetch<Usuario[]>('/api/usuarios')

// --- ESTADO DO MODAL ---
const modalAberto = ref(false)
const modoEdicao = ref(false)
const usuarioForm = ref({
  id: 0,
  nome: '',
  email: '',
  senha: '',
  perfil: 'GESTOR',
  setor: ''
})

const abrirModalCriacao = () => {
  modoEdicao.value = false
  usuarioForm.value = { id: 0, nome: '', email: '', senha: '', perfil: 'GESTOR', setor: '' }
  modalAberto.value = true
}

const abrirModalEdicao = (u: Usuario) => {
  modoEdicao.value = true
  usuarioForm.value = { 
    id: u.id, 
    nome: u.nome, 
    email: u.email, 
    senha: '', // Senha vazia na edição (só preenche se quiser trocar)
    perfil: u.perfil, 
    setor: u.setor || '' 
  }
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
}

// --- AÇÕES CRUD ---
const salvarUsuario = async () => {
  try {
    const endpoint = modoEdicao.value ? '/api/usuarios.put' : '/api/usuarios.post' // Nuxt mapeia .put e .post
    // Ajuste para chamar o endpoint correto com o método correto
    const method = modoEdicao.value ? 'PUT' : 'POST'
    const url = modoEdicao.value ? '/api/usuarios' : '/api/usuarios'

    await $fetch(url, {
      method: method,
      body: usuarioForm.value
    })

    alert(modoEdicao.value ? 'Usuário atualizado!' : 'Usuário criado!')
    modalAberto.value = false
    refresh() // Recarrega a lista
  } catch (error: any) {
    alert('Erro ao salvar: ' + (error.data?.statusMessage || error.message))
  }
}

const excluirUsuario = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return

  try {
    await $fetch('/api/usuarios', {
      method: 'DELETE',
      body: { id }
    })
    alert('Usuário excluído!')
    refresh()
  } catch (error: any) {
    alert('Erro ao excluir: ' + (error.data?.statusMessage || error.message))
  }
}

const getPerfilBadge = (perfil: string) => {
  switch (perfil) {
    case 'ADMIN': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'MASTER': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'GESTOR': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'FINANCEIRO': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
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

        <NuxtLink 
          v-if="['ADMIN', 'MASTER'].includes(usuario?.perfil || '')"
          to="/admin/usuarios" 
          class="flex items-center gap-4 px-4 py-3.5 bg-slate-700 text-white rounded-xl shadow-lg transition-all group"
        >
          <span class="material-icons">people_alt</span>
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
      
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-slide-down">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Gestão de Usuários</h2>
          <p class="text-slate-500 mt-1">Administração de acessos e perfis do sistema.</p>
        </div>
        
        <button 
          v-if="usuario?.perfil === 'MASTER'"
          @click="abrirModalCriacao"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
           <span class="material-icons text-sm">add</span>
           Novo Usuário
        </button>
        <div v-else class="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2">
           <span class="material-icons text-slate-400 text-sm">info</span>
           Apenas Leitura
        </div>
      </header>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>

      <div v-else class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
            <tr>
              <th class="p-5 pl-8">Usuário</th>
              <th class="p-5">Email</th>
              <th class="p-5">Perfil</th>
              <th class="p-5">Setor</th>
              <th class="p-5 text-right pr-8">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-slate-50/80 transition-colors group">
              <td class="p-5 pl-8">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {{ u.nome.charAt(0) }}
                  </div>
                  <p class="font-bold text-slate-800">{{ u.nome }}</p>
                </div>
              </td>
              <td class="p-5 text-sm font-medium text-slate-600">
                {{ u.email }}
              </td>
              <td class="p-5">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  :class="getPerfilBadge(u.perfil)"
                >
                  {{ u.perfil }}
                </span>
              </td>
              <td class="p-5 text-sm font-bold text-slate-500">
                {{ u.setor || '-' }}
              </td>
              <td class="p-5 text-right pr-8">
                <div v-if="usuario?.perfil === 'MASTER'" class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="abrirModalEdicao(u)" class="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Editar">
                    <span class="material-icons text-sm">edit</span>
                  </button>
                  <button @click="excluirUsuario(u.id)" class="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Excluir">
                    <span class="material-icons text-sm">delete</span>
                  </button>
                </div>
                <span v-else class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Ativo</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- MODAL DE CRIAÇÃO/EDIÇÃO -->
    <div v-if="modalAberto" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="fecharModal"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-scale-up">
        <div class="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-lg text-slate-800">{{ modoEdicao ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button @click="fecharModal" class="text-slate-400 hover:text-slate-600"><span class="material-icons">close</span></button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
            <input v-model="usuarioForm.nome" type="text" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Email Corporativo</label>
            <input v-model="usuarioForm.email" type="email" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Senha {{ modoEdicao ? '(Deixe em branco para manter)' : '' }}</label>
            <input v-model="usuarioForm.senha" type="password" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Perfil</label>
              <select v-model="usuarioForm.perfil" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="GESTOR">Gestor</option>
                <option value="PASSAGEM">Passagem</option>
                <option value="HOSPEDAGEM">Hospedagem</option>
                <option value="FINANCEIRO">Financeiro</option>
                <option value="ADMIN">Admin</option>
                <option value="MASTER">Master</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Setor (Opcional)</label>
              <input v-model="usuarioForm.setor" type="text" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: TI, RH...">
            </div>
          </div>
        </div>

        <div class="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button @click="fecharModal" class="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button @click="salvarUsuario" class="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            {{ modoEdicao ? 'Salvar Alterações' : 'Criar Usuário' }}
          </button>
        </div>
      </div>
    </div>

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
