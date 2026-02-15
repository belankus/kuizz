-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_ownerId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
