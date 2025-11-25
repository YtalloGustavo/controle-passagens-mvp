-- CreateTable
CREATE TABLE "Vaga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "direcao" TEXT NOT NULL,
    "vagasDisponiveis" INTEGER NOT NULL,
    "vagasExtras" INTEGER NOT NULL DEFAULT 0,
    "vagasOcupadas" INTEGER NOT NULL DEFAULT 0,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vaga_data_direcao_key" ON "Vaga"("data", "direcao");
