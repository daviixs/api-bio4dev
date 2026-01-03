-- CreateTable
CREATE TABLE "template_01" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_legenda" INTEGER NOT NULL,
    "id_projeto" INTEGER NOT NULL,
    "id_config" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_01_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_01_social" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "social_id" INTEGER NOT NULL,

    CONSTRAINT "template_01_social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_01_pages" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,

    CONSTRAINT "template_01_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_01_social_template_id_social_id_key" ON "template_01_social"("template_id", "social_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_01_pages_template_id_page_id_key" ON "template_01_pages"("template_id", "page_id");

-- AddForeignKey
ALTER TABLE "template_01" ADD CONSTRAINT "template_01_id_legenda_fkey" FOREIGN KEY ("id_legenda") REFERENCES "legenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01" ADD CONSTRAINT "template_01_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "projetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01" ADD CONSTRAINT "template_01_id_config_fkey" FOREIGN KEY ("id_config") REFERENCES "config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_social" ADD CONSTRAINT "template_01_social_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template_01"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_social" ADD CONSTRAINT "template_01_social_social_id_fkey" FOREIGN KEY ("social_id") REFERENCES "social_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_pages" ADD CONSTRAINT "template_01_pages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template_01"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_01_pages" ADD CONSTRAINT "template_01_pages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
