-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomePassageiro" TEXT NOT NULL,
    "cpfPassageiro" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "setor" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ANALISE_GESTOR',
    "vagaId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Solicitacao_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "setor" TEXT
);

-- CreateTable
CREATE TABLE "HistoricoAprovacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusAnterior" TEXT NOT NULL,
    "statusNovo" TEXT NOT NULL,
    "observacao" TEXT,
    "solicitacaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "HistoricoAprovacao_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoAprovacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
