DOCUMENTO DE ESPECIFICAÇÃO PARA SISTEMA DE CONTROLE DE PASSAGEM AÉREA

Recife x Fernando de Noronha (Ida e Volta)
________________________________________
1. Visão Geral do Sistema
1.1. Objetivo
Sistema para controle e gestão de passagens aéreas entre Recife e Fernando de Noronha, com fluxo de aprovação multinível e controle de vagas.
1.2. Escopo
	Gestão de vagas (regulares e extras)
	Fluxo de solicitação e aprovação multidepartamental
	Controle de bloqueio de vagas
	Cadastro de colaboradores e gestores
________________________________________
2. Regras de Negócio
2.1. Controle de Vagas
	Dias pares: 15 vagas regulares
	Dias ímpares: 10 vagas regulares
	Vagas extras: Adicionais às regulares, identificadas para filtro em relatórios
	Bloqueio de vagas: Gerente máster pode bloquear vagas para eventos
2.2. Fluxo de Aprovação
1.	Solicitação → Gestor de Unidade
2.	Análise Passagem → Gerente de Passagem (Aprovar/Negar)
3.	Análise Hospedagem → Gerente de Hospedagem (Aprovar/Negar/Info Casa Funcional)
4.	Verificação Volta → Gerente de Passagem (Confirma vagas na volta)
5.	Aprovação Final → Administrador (Aprovar/Negar)
6.	Aprovação Financeira → Superintendente Financeiro (Aprovar/Negar)
________________________________________
3. Especificações Técnicas
3.1. Stack Tecnológico
	Frontend: React + TypeScript
	Backend: Node.js (ou outra tecnologia) + TypeScript
	Banco de Dados: PostgreSQL
	Autenticação: JWT
________________________________________
4. Funcionalidades do Sistema
4.1. Módulo de Autenticação
	Tela de login com email e senha
	Redirecionamento baseado no perfil do usuário
	Recuperação de senha
4.2. Módulo de Gestor de Unidade
	Visualizar calendário com vagas disponíveis
	Solicitar passagem para colaborador
	Acompanhar status das solicitações
	Cadastrar colaboradores do setor
4.3. Módulo de Gerente de Passagem
	Visualizar solicitações pendentes
	Aprovar/negar solicitações (primeira análise)
	Verificar disponibilidade para data de volta
	Visualizar relatórios de passagens
4.4. Módulo de Gerente de Hospedagem
	Analisar necessidade de hospedagem
	Informar sobre casa funcional
	Aprovar/negar componente de hospedagem
4.5. Módulo de Administrador
	Aprovação final das solicitações
	Visão geral do sistema
	Gestão de usuários (leitura)
4.6. Módulo de Superintendente Financeiro
	Aprovação financeira final
	Visualizar relatórios financeiros
4.7. Módulo de Gerente Master
	Bloquear vagas para eventos
	Visualizar todas as vagas e ocupações
	Relatórios completos do sistema
________________________________________
5. Interface do Usuário
5.1. Telas Principais
Tela de Login
typescript
interface LoginData {
    email: string;
    senha: string;
}
Dashboard por Perfil
	Gestor: Calendário + Solicitações + Cadastro Colaboradores
	Gerente Passagem: Lista Solicitações + Análise
	Gerente Hospedagem: Lista Solicitações + Análise
	Admin: Lista Solicitações + Aprovação Final
	Financeiro: Lista Solicitações + Aprovação Financeira
	Master: Bloqueio Vagas + Relatórios
Componente Calendário
typescript
interface VagaDia {
    data: Date;
    vagasDisponiveis: number;
    vagasExtras: number;
    bloqueado: boolean;
    vagasOcupadas: number;
}
________________________________________
6. API Endpoints
6.1. Autenticação
	POST /api/auth/login
	POST /api/auth/logout
	POST /api/auth/refresh
6.2. Vagas
	GET /api/vagas?mes=YYYY-MM&direcao=IDA|VOLTA
	POST /api/vagas/bloquear
	GET /api/vagas/disponibilidade?data=YYYY-MM-DD&direcao=IDA|VOLTA
6.3. Solicitações
	GET /api/solicitacoes
	POST /api/solicitacoes
	PUT /api/solicitacoes/:id/aprovar-passagem
	PUT /api/solicitacoes/:id/aprovar-hospedagem
	PUT /api/solicitacoes/:id/confirmar-volta
	PUT /api/solicitacoes/:id/aprovar-admin
	PUT /api/solicitacoes/:id/aprovar-financeiro
6.4. Colaboradores
	GET /api/colaboradores
	POST /api/colaboradores
	PUT /api/colaboradores/:id
6.5. Relatórios
	GET /api/relatorios/passagens?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
	GET /api/relatorios/ocupacao
________________________________________
7. Regras de Validação
7.1. Solicitações
	Gestor só pode solicitar para colaboradores do seu setor
	Não permitir solicitação em vagas bloqueadas
	Verificar disponibilidade na ida e volta
	Status deve seguir fluxo sequencial
7.2. Vagas
	Cálculo automático de vagas baseado em paridade do dia
	Vagas extras são adicionais às regulares
	Vagas bloqueadas reduzem a disponibilidade
________________________________________
8. Implementação React + TypeScript
8.1. Estrutura de Pastas
text
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── dashboard/
│   └── solicitacoes/
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   └── Solicitacoes/
├── services/
│   ├── api.ts
│   └── auth.ts
├── types/
│   ├── user.ts
│   ├── vaga.ts
│   └── solicitacao.ts
└── contexts/
    ├── AuthContext.tsx
    └── AppContext.tsx
8.2. Types Principais
typescript
interface User {
    id: number;
    email: string;
    nome: string;
    perfil: string;
    setor_id?: number;
}

interface Vaga {
    id: number;
    data: string;
    direcao: 'IDA' | 'VOLTA';
    vagasDisponiveis: number;
    vagasExtras: number;
    bloqueado: boolean;
}

interface Solicitacao {
    id: number;
    colaborador: Colaborador;
    data_ida: string;
    data_volta: string;
    status: string;
    aprovacoes: Aprovacoes;
}
________________________________________
9. Considerações de Segurança
	Autenticação JWT
	Validação de perfil para cada endpoint
	Sanitização de inputs
	Log de atividades sensíveis
	Criptografia de senhas
________________________________________
10. Próximos Passos
1.	Protótipo de interface
2.	Modelagem detalhada do banco
3.	Desenvolvimento da API
4.	Desenvolvimento do frontend
5.	Testes integrados
6.	Deploy e validação
