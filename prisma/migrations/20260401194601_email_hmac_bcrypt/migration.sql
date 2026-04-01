/*
  Warnings:

  - You are about to drop the column `senha` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailIndex]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jti]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('desktop', 'mobile', 'tablet');

-- DropIndex
DROP INDEX "user_email_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "senha",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "emailBcrypt" TEXT,
ADD COLUMN     "emailHashVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "emailIndex" VARCHAR(255),
ADD COLUMN     "emailMasked" VARCHAR(255),
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleId" VARCHAR(255),
ADD COLUMN     "jti" VARCHAR(255),
ADD COLUMN     "language" VARCHAR(10),
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timezone" VARCHAR(60),
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" VARCHAR(60),
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "jti" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "device" "DeviceType" NOT NULL,
    "sessionDurationMs" INTEGER NOT NULL DEFAULT 0,
    "isBounce" BOOLEAN NOT NULL DEFAULT false,
    "uniqueVisitorId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_tokenHash_key" ON "refresh_token"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_jti_key" ON "refresh_token"("jti");

-- CreateIndex
CREATE INDEX "refresh_token_userId_idx" ON "refresh_token"("userId");

-- CreateIndex
CREATE INDEX "refresh_token_jti_idx" ON "refresh_token"("jti");

-- CreateIndex
CREATE INDEX "Visit_profileId_idx" ON "Visit"("profileId");

-- CreateIndex
CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_emailIndex_key" ON "user"("emailIndex");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_jti_key" ON "user"("jti");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
