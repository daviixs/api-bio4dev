/*
  Warnings:

  - You are about to drop the `config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `custom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `legenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projetos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01_social` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "config" DROP CONSTRAINT "config_id_user_fkey";

-- DropForeignKey
ALTER TABLE "custom" DROP CONSTRAINT "custom_page_id_fkey";

-- DropForeignKey
ALTER TABLE "legenda" DROP CONSTRAINT "legenda_id_user_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "projetos" DROP CONSTRAINT "projetos_id_user_fkey";

-- DropForeignKey
ALTER TABLE "social_accounts" DROP CONSTRAINT "social_accounts_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01" DROP CONSTRAINT "template_01_id_config_fkey";

-- DropForeignKey
ALTER TABLE "template_01" DROP CONSTRAINT "template_01_id_legenda_fkey";

-- DropForeignKey
ALTER TABLE "template_01" DROP CONSTRAINT "template_01_id_projeto_fkey";

-- DropForeignKey
ALTER TABLE "template_01_pages" DROP CONSTRAINT "template_01_pages_page_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_pages" DROP CONSTRAINT "template_01_pages_template_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_social" DROP CONSTRAINT "template_01_social_social_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_social" DROP CONSTRAINT "template_01_social_template_id_fkey";

-- DropTable
DROP TABLE "config";

-- DropTable
DROP TABLE "custom";

-- DropTable
DROP TABLE "legenda";

-- DropTable
DROP TABLE "pages";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "projetos";

-- DropTable
DROP TABLE "social_accounts";

-- DropTable
DROP TABLE "template_01";

-- DropTable
DROP TABLE "template_01_pages";

-- DropTable
DROP TABLE "template_01_social";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" VARCHAR(40) NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "themeId" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "ordem" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Custom" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "tipo" "TipoBloco" NOT NULL,
    "ordem" INTEGER NOT NULL,
    "titulo" VARCHAR(120),
    "conteudo" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Custom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Social" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Legenda" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "legendaFoto" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Legenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "stacks" INTEGER NOT NULL,
    "projetos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "legendaId" INTEGER NOT NULL,
    "projetoId" INTEGER NOT NULL,
    "configId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSocial" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "socialId" INTEGER NOT NULL,

    CONSTRAINT "TemplateSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePage" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "TemplatePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_profileId_idx" ON "Page"("profileId");

-- CreateIndex
CREATE INDEX "Custom_pageId_idx" ON "Custom"("pageId");

-- CreateIndex
CREATE INDEX "Social_profileId_idx" ON "Social"("profileId");

-- CreateIndex
CREATE INDEX "Legenda_profileId_idx" ON "Legenda"("profileId");

-- CreateIndex
CREATE INDEX "Projeto_profileId_idx" ON "Projeto"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Config_profileId_key" ON "Config"("profileId");

-- CreateIndex
CREATE INDEX "Config_profileId_idx" ON "Config"("profileId");

-- CreateIndex
CREATE INDEX "Template_profileId_idx" ON "Template"("profileId");

-- CreateIndex
CREATE INDEX "Template_legendaId_idx" ON "Template"("legendaId");

-- CreateIndex
CREATE INDEX "Template_projetoId_idx" ON "Template"("projetoId");

-- CreateIndex
CREATE INDEX "Template_configId_idx" ON "Template"("configId");

-- CreateIndex
CREATE INDEX "TemplateSocial_templateId_idx" ON "TemplateSocial"("templateId");

-- CreateIndex
CREATE INDEX "TemplateSocial_socialId_idx" ON "TemplateSocial"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSocial_templateId_socialId_key" ON "TemplateSocial"("templateId", "socialId");

-- CreateIndex
CREATE INDEX "TemplatePage_templateId_idx" ON "TemplatePage"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePage_pageId_idx" ON "TemplatePage"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePage_templateId_pageId_key" ON "TemplatePage"("templateId", "pageId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Custom" ADD CONSTRAINT "Custom_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Legenda" ADD CONSTRAINT "Legenda_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_legendaId_fkey" FOREIGN KEY ("legendaId") REFERENCES "Legenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSocial" ADD CONSTRAINT "TemplateSocial_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSocial" ADD CONSTRAINT "TemplateSocial_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePage" ADD CONSTRAINT "TemplatePage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePage" ADD CONSTRAINT "TemplatePage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
