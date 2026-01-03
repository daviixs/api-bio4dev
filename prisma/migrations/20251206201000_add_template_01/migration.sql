-- CreateTable
CREATE TABLE "template_01" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_legenda" INTEGER NOT NULL,
    "id_config" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_01_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_01_projetos" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_01_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_01_social" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "social_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_01_social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_01_pages" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_01_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_01_id_user_key" ON "template_01"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_id_legenda_key" ON "template_01"("id_legenda");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_id_config_key" ON "template_01"("id_config");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_projetos_template_id_projeto_id_key" ON "template_01_projetos"("template_id", "projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_social_template_id_social_id_key" ON "template_01_social"("template_id", "social_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_pages_template_id_page_id_key" ON "template_01_pages"("template_id", "page_id");

-- AddForeignKey
ALTER TABLE "template_01" ADD CONSTRAINT "template_01_id_legenda_fkey" FOREIGN KEY ("id_legenda") REFERENCES "legenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01" ADD CONSTRAINT "template_01_id_config_fkey" FOREIGN KEY ("id_config") REFERENCES "config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_projetos" ADD CONSTRAINT "template_01_projetos_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template_01"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_projetos" ADD CONSTRAINT "template_01_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_social" ADD CONSTRAINT "template_01_social_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template_01"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_social" ADD CONSTRAINT "template_01_social_social_id_fkey" FOREIGN KEY ("social_id") REFERENCES "social_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_pages" ADD CONSTRAINT "template_01_pages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template_01"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_pages" ADD CONSTRAINT "template_01_pages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
