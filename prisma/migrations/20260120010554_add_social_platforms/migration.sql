/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Plataforma" ADD VALUE 'facebook';
ALTER TYPE "Plataforma" ADD VALUE 'x';
ALTER TYPE "Plataforma" ADD VALUE 'threads';
ALTER TYPE "Plataforma" ADD VALUE 'website';
ALTER TYPE "Plataforma" ADD VALUE 'spotify';
ALTER TYPE "Plataforma" ADD VALUE 'soundcloud';
ALTER TYPE "Plataforma" ADD VALUE 'snapchat';
ALTER TYPE "Plataforma" ADD VALUE 'patreon';
ALTER TYPE "Plataforma" ADD VALUE 'twitch';
ALTER TYPE "Plataforma" ADD VALUE 'applemusic';
ALTER TYPE "Plataforma" ADD VALUE 'figma';
ALTER TYPE "Plataforma" ADD VALUE 'devto';
ALTER TYPE "Plataforma" ADD VALUE 'dev';
ALTER TYPE "Plataforma" ADD VALUE 'email';
ALTER TYPE "Plataforma" ADD VALUE 'behance';
ALTER TYPE "Plataforma" ADD VALUE 'dribbble';
ALTER TYPE "Plataforma" ADD VALUE 'medium';
ALTER TYPE "Plataforma" ADD VALUE 'pinterest';
ALTER TYPE "Plataforma" ADD VALUE 'gitlab';
ALTER TYPE "Plataforma" ADD VALUE 'bitbucket';
ALTER TYPE "Plataforma" ADD VALUE 'stackoverflow';
ALTER TYPE "Plataforma" ADD VALUE 'codepen';
ALTER TYPE "Plataforma" ADD VALUE 'discord';
ALTER TYPE "Plataforma" ADD VALUE 'whatsapp';
ALTER TYPE "Plataforma" ADD VALUE 'telegram';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TemplateType" ADD VALUE 'template_04';
ALTER TYPE "TemplateType" ADD VALUE 'template_05';
ALTER TYPE "TemplateType" ADD VALUE 'template_06';
ALTER TYPE "TemplateType" ADD VALUE 'template_07';
ALTER TYPE "TemplateType" ADD VALUE 'template_08';
ALTER TYPE "TemplateType" ADD VALUE 'template_09';
ALTER TYPE "TemplateType" ADD VALUE 'template_10';
ALTER TYPE "TemplateType" ADD VALUE 'template_11';
ALTER TYPE "TemplateType" ADD VALUE 'template_12';
ALTER TYPE "TemplateType" ADD VALUE 'template_13';
ALTER TYPE "TemplateType" ADD VALUE 'template_14';

-- DropForeignKey
ALTER TABLE "Config" DROP CONSTRAINT "Config_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Custom" DROP CONSTRAINT "Custom_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Footer" DROP CONSTRAINT "Footer_profileId_fkey";

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
ALTER TABLE "TechStack" DROP CONSTRAINT "TechStack_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Technology" DROP CONSTRAINT "Technology_techStackId_fkey";

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

-- DropForeignKey
ALTER TABLE "WorkExperience" DROP CONSTRAINT "WorkExperience_profileId_fkey";

-- DropForeignKey
ALTER TABLE "WorkResponsibility" DROP CONSTRAINT "WorkResponsibility_workExperienceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkTechnology" DROP CONSTRAINT "WorkTechnology_workExperienceId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "Footer" ADD COLUMN     "madeWith" TEXT,
ADD COLUMN     "resumeUrl" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(60) NOT NULL,
ADD COLUMN     "templateSourceId" UUID,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "gif" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LinkButton" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "subtext" VARCHAR(200),
    "icon" VARCHAR(50),
    "style" VARCHAR(100),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkButton_profileId_idx" ON "LinkButton"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");

-- CreateIndex
CREATE INDEX "Profile_slug_idx" ON "Profile"("slug");

-- CreateIndex
CREATE INDEX "Profile_userId_isActive_idx" ON "Profile"("userId", "isActive");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_templateSourceId_fkey" FOREIGN KEY ("templateSourceId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Custom" ADD CONSTRAINT "Custom_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Legenda" ADD CONSTRAINT "Legenda_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkButton" ADD CONSTRAINT "LinkButton_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_legendaId_fkey" FOREIGN KEY ("legendaId") REFERENCES "Legenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSocial" ADD CONSTRAINT "TemplateSocial_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSocial" ADD CONSTRAINT "TemplateSocial_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "Social"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePage" ADD CONSTRAINT "TemplatePage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePage" ADD CONSTRAINT "TemplatePage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechStack" ADD CONSTRAINT "TechStack_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_techStackId_fkey" FOREIGN KEY ("techStackId") REFERENCES "TechStack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTechnology" ADD CONSTRAINT "WorkTechnology_workExperienceId_fkey" FOREIGN KEY ("workExperienceId") REFERENCES "WorkExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkResponsibility" ADD CONSTRAINT "WorkResponsibility_workExperienceId_fkey" FOREIGN KEY ("workExperienceId") REFERENCES "WorkExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footer" ADD CONSTRAINT "Footer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
