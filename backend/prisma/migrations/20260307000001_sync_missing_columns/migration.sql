-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN "roomCode" TEXT;

-- AlterTable
ALTER TABLE "GamePlayer" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "GamePlayer_userId_idx" ON "GamePlayer"("userId");

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
