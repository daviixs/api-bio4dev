/*
  Warnings:

  - You are about to drop the column `themeId` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Colors" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "themeId",
ADD COLUMN     "mainColor" VARCHAR(7),
ADD COLUMN     "theme" "Colors" NOT NULL DEFAULT 'LIGHT';
