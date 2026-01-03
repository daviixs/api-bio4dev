-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Plataforma" ADD VALUE 'linkedin';
ALTER TYPE "Plataforma" ADD VALUE 'twitter';

-- AlterTable
ALTER TABLE "Legenda" ADD COLUMN     "greeting" VARCHAR(100);

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "codeLink" TEXT,
ADD COLUMN     "demoLink" TEXT,
ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TechStack" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(200) NOT NULL,

    CONSTRAINT "TechStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" UUID NOT NULL,
    "techStackId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "company" VARCHAR(100) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "summary" TEXT NOT NULL,
    "impact" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTechnology" (
    "id" UUID NOT NULL,
    "workExperienceId" UUID NOT NULL,
    "technology" VARCHAR(50) NOT NULL,

    CONSTRAINT "WorkTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkResponsibility" (
    "id" UUID NOT NULL,
    "workExperienceId" UUID NOT NULL,
    "responsibility" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkResponsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Footer" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(200) NOT NULL,
    "email" VARCHAR(100),
    "github" VARCHAR(100),
    "linkedin" VARCHAR(100),
    "twitter" VARCHAR(100),
    "copyrightName" VARCHAR(100) NOT NULL,

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechStack_profileId_key" ON "TechStack"("profileId");

-- CreateIndex
CREATE INDEX "TechStack_profileId_idx" ON "TechStack"("profileId");

-- CreateIndex
CREATE INDEX "Technology_techStackId_idx" ON "Technology"("techStackId");

-- CreateIndex
CREATE INDEX "WorkExperience_profileId_idx" ON "WorkExperience"("profileId");

-- CreateIndex
CREATE INDEX "WorkTechnology_workExperienceId_idx" ON "WorkTechnology"("workExperienceId");

-- CreateIndex
CREATE INDEX "WorkResponsibility_workExperienceId_idx" ON "WorkResponsibility"("workExperienceId");

-- CreateIndex
CREATE UNIQUE INDEX "Footer_profileId_key" ON "Footer"("profileId");

-- CreateIndex
CREATE INDEX "Footer_profileId_idx" ON "Footer"("profileId");

-- AddForeignKey
ALTER TABLE "TechStack" ADD CONSTRAINT "TechStack_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technology" ADD CONSTRAINT "Technology_techStackId_fkey" FOREIGN KEY ("techStackId") REFERENCES "TechStack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTechnology" ADD CONSTRAINT "WorkTechnology_workExperienceId_fkey" FOREIGN KEY ("workExperienceId") REFERENCES "WorkExperience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkResponsibility" ADD CONSTRAINT "WorkResponsibility_workExperienceId_fkey" FOREIGN KEY ("workExperienceId") REFERENCES "WorkExperience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Footer" ADD CONSTRAINT "Footer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
