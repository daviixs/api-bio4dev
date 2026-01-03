-- CreateTable
CREATE TABLE "legenda" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "legenda_foto" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gif" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "stacks" INTEGER NOT NULL,
    "projetos" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_id_user_key" ON "config"("id_user");

-- AddForeignKey
ALTER TABLE "legenda" ADD CONSTRAINT "legenda_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
