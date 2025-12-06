# Documentação de Testes e Verificação - Controle de Passagens

Este documento detalha como preparar o ambiente, executar testes automatizados e realizar verificações manuais no sistema.

## 1. Preparação do Ambiente

Antes de iniciar os testes, certifique-se de que as dependências estão instaladas e o banco de dados está preparado.

### Instalação
```bash
npm install
```

### Configuração do Banco de Dados
O projeto utiliza Prisma com SQLite (dev.db). Para configurar o banco e popular com dados iniciais (usuários de teste):

```bash
# Executar migrações (criar tabelas)
npx prisma migrate dev --name init

# Popular o banco com usuários padrão (se não tiver sido feito automaticamente)
node prisma/seed.js
```

### Iniciar o Servidor
Para rodar a aplicação web:
```bash
npm run dev
```
O sistema estará acessível em: http://localhost:3000

---

## 2. Verificação Automatizada

O projeto inclui scripts de verificação que testam fluxos críticos da API diretamente. Esses scripts simulam o uso do sistema (login, criação de fluxo, aprovações, etc.).

**Como rodar:**
No terminal, execute os arquivos `verify_*.js` com Node.js.

| Script | O que ele testa? |
|--------|------------------|
| `node verify_flow.js` | **Fluxo Completo:** Busca vaga, cria solicitação, e passa por TODAS as aprovações (Gestor -> Passagem -> Hospedagem -> Admin -> Financeiro). |
| `node verify_login.js` | **Autenticação:** Testa login com sucesso e falha (senha incorreta). |
| `node verify_round_trip.js` | **Ida e Volta:** Verifica a lógica de reservar passagens de ida e volta. |
| `node verify_seats.js` | **Vagas:** Verifica a contagem de vagas e lógica de dias pares/ímpares. |
| `node verify_blocking.js` | **Bloqueios:** Testa o bloqueio de vagas pelo Manager. |

**Exemplo de Saída Sucesso:**
```
🚀 Iniciando verificação do fluxo...
✅ Vaga encontrada...
✅ Solicitação criada...
✅ Aprovado! Novo status: ANALISE_PASSAGEM
...
🎉 Fluxo completo verificado com sucesso!
```

---

## 3. Testes Manuais (Interface Web)

Para validar a interface do usuário (UI), acesse `http://localhost:3000` e utilize as credenciais abaixo.

### Credenciais de Teste (Padrão)
A senha padrão para todos os usuários abaixo é: `123`

| Perfil | Email | Função no Teste |
|--------|-------|-----------------|
| **Gestor** | `gestor@ti.com` | Solicitar passagens para colaboradores. |
| **Passagens** | `passagem@voo.com` | Aprovar solicitação inicial e confirmar volta. |
| **Hospedagem** | `hospedagem@pousada.com` | Analisar necessidade de hospedagem. |
| **Admin** | `admin@sistema.com` | Aprovação administrativa final. |
| **Financeiro** | `financeiro@banco.com` | Aprovação orçamentária (última etapa). |
| **Master** | `master@sistema.com` | Bloquear vagas e ver relatórios globais. |

### Cenário 1: Fluxo Feliz (Solicitação até Aprovação)
1. **Login como Gestor (`gestor@ti.com` / `123`)**
   - Vá em "Nova Solicitação".
   - Escolha uma data com vagas.
   - Preencha os dados de um colaborador.
   - Envie. Status esperado: `AGUARDANDO_GESTOR` (ou `ANALISE_PASSAGEM` se auto-aprovado).
2. **Login com Outros Perfis**
   - Faça logout e entre com o perfil da próxima etapa (ex: `passagem@voo.com`).
   - A solicitação deve aparecer na lista de "Pendentes".
   - Clique em "Aprovar".
   - Repita para os demais perfis na ordem: Gestor → Passagem → Hospedagem → Passagem (Confirmação Volta) → Admin → Financeiro.

### Cenário 2: Verificação de Vagas
1. **Login como Qualquer Usuário**
   - Verifique o calendário/lista de vagas.
   - Observe se em dias PARES há 15 vagas e ÍMPARES 10 vagas.

### Cenário 3: Bloqueio de Vagas (Master)
1. **Login como Master (`master@sistema.com` / `123`)**
   - Selecione uma data futura.
   - Bloqueie as vagas.
2. **Teste de Bloqueio**
   - Tente logar como Gestor e solicitar para essa data. O sistema deve impedir ou mostrar 0 vagas.

---

## 4. Solução de Problemas Comuns

- **Erro "Nenhuma vaga disponível"**: O script `verify_flow.js` busca o primeiro dia com vagas. Se todos estiverem cheios/bloqueados no banco de teste, você pode precisar resetar o banco (`npx prisma migrate reset`) ou rodar um script para liberar vagas.
- **Login Falhando**: Certifique-se de que rodou `node prisma/seed.js`.
- **Porta em uso**: Se o `3000` estiver ocupado, o Nuxt pode abrir no `3001`. Verifique o terminal.
