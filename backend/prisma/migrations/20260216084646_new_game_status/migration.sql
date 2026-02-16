/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,nickname]` on the table `GamePlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'STARTED', 'FINISHED', 'ABORTED');

-- AlterTable
ALTER TABLE "GamePlayer" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "hostId" TEXT,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'WAITING';

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_sessionId_nickname_key" ON "GamePlayer"("sessionId", "nickname");
