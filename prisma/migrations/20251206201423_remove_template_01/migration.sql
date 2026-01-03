/*
  Warnings:

  - You are about to drop the `template_01` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01_projetos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_01_social` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "template_01" DROP CONSTRAINT "template_01_id_config_fkey";

-- DropForeignKey
ALTER TABLE "template_01" DROP CONSTRAINT "template_01_id_legenda_fkey";

-- DropForeignKey
ALTER TABLE "template_01_pages" DROP CONSTRAINT "template_01_pages_page_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_pages" DROP CONSTRAINT "template_01_pages_template_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_projetos" DROP CONSTRAINT "template_01_projetos_projeto_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_projetos" DROP CONSTRAINT "template_01_projetos_template_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_social" DROP CONSTRAINT "template_01_social_social_id_fkey";

-- DropForeignKey
ALTER TABLE "template_01_social" DROP CONSTRAINT "template_01_social_template_id_fkey";

-- DropTable
DROP TABLE "template_01";

-- DropTable
DROP TABLE "template_01_pages";

-- DropTable
DROP TABLE "template_01_projetos";

-- DropTable
DROP TABLE "template_01_social";
