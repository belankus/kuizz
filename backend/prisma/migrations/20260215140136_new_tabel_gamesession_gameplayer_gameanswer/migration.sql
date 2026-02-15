-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "quizId" TEXT,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAnswer" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,

    CONSTRAINT "GameAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_quizId_idx" ON "GameSession"("quizId");

-- CreateIndex
CREATE INDEX "GamePlayer_sessionId_idx" ON "GamePlayer"("sessionId");

-- CreateIndex
CREATE INDEX "GameAnswer_playerId_idx" ON "GameAnswer"("playerId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAnswer" ADD CONSTRAINT "GameAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
