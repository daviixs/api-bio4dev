/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Custom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Legenda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Page` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Projeto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Social` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Template` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplatePage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TemplateSocial` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Config` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Config` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Custom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pageId` on the `Custom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Legenda` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Legenda` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Page` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Page` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Projeto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Projeto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Social` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Social` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `profileId` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `legendaId` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projetoId` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `configId` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `TemplatePage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplatePage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pageId` on the `TemplatePage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `TemplateSocial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `templateId` on the `TemplateSocial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `socialId` on the `TemplateSocial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Config" DROP CONSTRAINT "Config_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Custom" DROP CONSTRAINT "Custom_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Legenda" DROP CONSTRAINT "Legenda_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Projeto" DROP CONSTRAINT "Projeto_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Social" DROP CONSTRAINT "Social_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_configId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_legendaId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_projetoId_fkey";

-- DropForeignKey
ALTER TABLE "TemplatePage" DROP CONSTRAINT "TemplatePage_pageId_fkey";

-- DropForeignKey
ALTER TABLE "TemplatePage" DROP CONSTRAINT "TemplatePage_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSocial" DROP CONSTRAINT "TemplateSocial_socialId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateSocial" DROP CONSTRAINT "TemplateSocial_templateId_fkey";

-- AlterTable
ALTER TABLE "Config" DROP CONSTRAINT "Config_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
ADD CONSTRAINT "Config_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Custom" DROP CONSTRAINT "Custom_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "pageId",
ADD COLUMN     "pageId" UUID NOT NULL,
ADD CONSTRAINT "Custom_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Legenda" DROP CONSTRAINT "Legenda_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
ADD CONSTRAINT "Legenda_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Page" DROP CONSTRAINT "Page_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
ADD CONSTRAINT "Page_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Projeto" DROP CONSTRAINT "Projeto_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
ADD CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Social" DROP CONSTRAINT "Social_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
ADD CONSTRAINT "Social_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Template" DROP CONSTRAINT "Template_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID NOT NULL,
DROP COLUMN "legendaId",
ADD COLUMN     "legendaId" UUID NOT NULL,
DROP COLUMN "projetoId",
ADD COLUMN     "projetoId" UUID NOT NULL,
DROP COLUMN "configId",
ADD COLUMN     "configId" UUID NOT NULL,
ADD CONSTRAINT "Template_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TemplatePage" DROP CONSTRAINT "TemplatePage_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "templateId",
ADD COLUMN     "templateId" UUID NOT NULL,
DROP COLUMN "pageId",
ADD COLUMN     "pageId" UUID NOT NULL,
ADD CONSTRAINT "TemplatePage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TemplateSocial" DROP CONSTRAINT "TemplateSocial_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "templateId",
ADD COLUMN     "templateId" UUID NOT NULL,
DROP COLUMN "socialId",
ADD COLUMN     "socialId" UUID NOT NULL,
ADD CONSTRAINT "TemplateSocial_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Config_profileId_key" ON "Config"("profileId");

-- CreateIndex
CREATE INDEX "Config_profileId_idx" ON "Config"("profileId");

-- CreateIndex
CREATE INDEX "Custom_pageId_idx" ON "Custom"("pageId");

-- CreateIndex
CREATE INDEX "Legenda_profileId_idx" ON "Legenda"("profileId");

-- CreateIndex
CREATE INDEX "Page_profileId_idx" ON "Page"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Projeto_profileId_idx" ON "Projeto"("profileId");

-- CreateIndex
CREATE INDEX "Social_profileId_idx" ON "Social"("profileId");

-- CreateIndex
CREATE INDEX "Template_profileId_idx" ON "Template"("profileId");

-- CreateIndex
CREATE INDEX "Template_legendaId_idx" ON "Template"("legendaId");

-- CreateIndex
CREATE INDEX "Template_projetoId_idx" ON "Template"("projetoId");

-- CreateIndex
CREATE INDEX "Template_configId_idx" ON "Template"("configId");

-- CreateIndex
CREATE INDEX "TemplatePage_templateId_idx" ON "TemplatePage"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePage_pageId_idx" ON "TemplatePage"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePage_templateId_pageId_key" ON "TemplatePage"("templateId", "pageId");

-- CreateIndex
CREATE INDEX "TemplateSocial_templateId_idx" ON "TemplateSocial"("templateId");

-- CreateIndex
CREATE INDEX "TemplateSocial_socialId_idx" ON "TemplateSocial"("socialId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSocial_templateId_socialId_key" ON "TemplateSocial"("templateId", "socialId");

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
