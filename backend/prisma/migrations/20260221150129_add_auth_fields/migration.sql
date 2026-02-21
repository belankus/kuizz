-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
