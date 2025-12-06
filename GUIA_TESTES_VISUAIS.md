# Guia de Testes Visuais - Controle de Passagens

Este guia foi desenhado para você testar **manualmente** a interface do sistema, clicando nos botões e visualizando as telas, sem usar códigos ou scripts.

---

## 🔐 1. Credenciais de Acesso

Use estas contas para logar e testar cada perfil. A senha é sempre `123`.

| Perfil | Email (Login) | Senha | O que ele faz? |
| :--- | :--- | :--- | :--- |
| **Gestor** | `gestor@ti.com` | `123` | Cria solicitações para sua equipe. |
| **Passagens** | `passagem@voo.com` | `123` | 1ª aprovação e confirmação de volta. |
| **Hospedagem** | `hospedagem@pousada.com` | `123` | Aprova necessidade de hotel/casa. |
| **Admin** | `admin@sistema.com` | `123` | Aprovação final administrativa. |
| **Financeiro** | `financeiro@banco.com` | `123` | Aprovação orçamentária final. |
| **Master** | `master@sistema.com` | `123` | Bloqueia vagas e vê tudo. |

---

## 🧪 Roteiros de Teste

Siga estes passos na ordem para simular o "Caminho Feliz" (tudo dando certo).

### Cenário A: Criar e Aprovar uma Viagem (Ciclo Completo)

Este é o teste mais importante. Você vai passar por todos os usuários.

#### Passo 1: Solicitar (Como Gestor)
1. Abra `http://localhost:3000`
2. Faça login como **Gestor** (`gestor@ti.com` / `123`).
3. No menu lateral, clique em **Nova Solicitação** ou escolha um voo no Dashboard e clique em **"Solicitar Reserva"**.
4. Preencha o formulário:
   - **Nome:** Coloque "Teste Visual"
   - **CPF:** `111.111.111-11`
   - **Data Nasc:** Qualquer uma.
   - **Data Ida:** (Já vem preenchida se clicou no card).
   - **Data Volta:** Escolha uma data posterior a ida.
   - **Motivo:** "Visita técnica"
5. Clique em **Enviar Solicitação**.
6. Vá para o menu **Minhas Solicitações**.
   - Verifique se o status está `AGUARDANDO_GESTOR` ou `ANALISE_PASSAGEM` (se você for o próprio gestor do setor, pode já ir para Passagem).
7. **Saia da conta** (Clique no seu nome no canto inferior esquerdo -> Sair, ou apenas limpe os cookies/recarregue se não houver botão de sair explícito).

#### Passo 2: Aprovação Inicial (Como Passagens)
1. Faça login como **Passagens** (`passagem@voo.com` / `123`).
2. No menu lateral, clique em **Sala de Comando** (ícone de martelo).
3. Você deve ver a solicitação "Teste Visual" na lista.
4. Clique no botão **APROVAR** (verde).
   - O status deve mudar para `ANALISE_HOSPEDAGEM`.
5. Saia da conta.

#### Passo 3: Hospedagem (Como Hospedagem)
1. Faça login como **Hospedagem** (`hospedagem@pousada.com` / `123`).
2. Vá para **Sala de Comando**.
3. Encontre a solicitação. Agora você tem opções extras de hospedagem.
4. Selecione "Casa Funcional" e digite "Casa 01".
5. Clique em **APROVAR**.
   - O status deve mudar para `VERIFICACAO_VOLTA`.
6. Saia da conta.

#### Passo 4: Confirmar Volta (Como Passagens Novamente)
1. Faça login como **Passagens** (`passagem@voo.com`).
2. Vá para **Sala de Comando**.
3. A solicitação voltou para você confirmar que há vaga no voo de volta.
4. Clique em **APROVAR** (Confirmar Volta).
   - O status deve mudar para `APROVACAO_ADMIN`.
5. Saia da conta.

#### Passo 5: Admin (Como Administrador)
1. Faça login como **Admin** (`admin@sistema.com` / `123`).
2. Vá para **Sala de Comando**.
3. Clique em **APROVAR**.
   - O status deve mudar para `ANALISE_FINANCEIRO`.
4. Saia da conta.

#### Passo 6: Financeiro (Como Financeiro)
1. Faça login como **Financeiro** (`financeiro@banco.com` / `123`).
2. Vá para **Sala de Comando**.
3. Clique em **APROVAR** (Pagamento realizado).
   - O status final deve ser `EMITIDO` ou `CONCLUIDO`.

✅ **Resultado Esperado:** O ciclo se encerra e a passagem é considerada emitida.

---

### Cenário B: Bloqueio de Vagas (Como Master)

Testar se o bloqueio de voos funciona visualmente.

1. Faça login como **Master** (`master@sistema.com` / `123`).
2. No Dashboard, você verá os cards de voos.
3. No canto superior direito de cada card, há um **Cadeado**.
4. Clique no cadeado de um voo que tenha vagas.
   - Confirme a ação.
   - O card deve ficar cinza/opaco e aparecer uma faixa "BLOQUEADO".
5. **Teste o Bloqueio:**
   - Tente clicar em "Solicitar Reserva" (se o botão ainda existir) ou verifique se o botão mudou para "Bloqueado pelo Gestor".
   - Se tentar logar como Gestor (`gestor@ti.com`), esse voo específico deve estar indisponível para clique.

---

### Cenário C: Verificação de Dashboard (Visual)

1. Faça login com qualquer usuário.
2. Na tela inicial (**Visão Geral**):
   - Verifique se os cards de voos aparecem.
   - Teste os filtros no topo: Clique em "Ida", "Volta", "Todos".
   - Digite no campo de busca uma data (ex: "Sexta") e veja se filtra os cards.
   - Alterne a visualização entre **Grid** (Blocos) e **Lista** (Tabela) usando os ícones ao lado da busca.

---

## ❓ O que fazer se der erro?

- **Não consigo logar:** Reinicie o servidor (`npm run dev`) e verifique se rodou o `node prisma/seed.js`.
- **Botão Sair não existe:** Se não achar o botão de sair na UI, você pode abrir uma janela anônima para trocar de usuário.
- **Tela em branco:** Verifique o terminal onde o `npm run dev` está rodando para ver se houve erro no código.
