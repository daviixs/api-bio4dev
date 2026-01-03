/*
  Warnings:

  - Added the required column `templateType` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('template_01', 'template_02', 'template_03');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "templateType" "TemplateType" NOT NULL;
