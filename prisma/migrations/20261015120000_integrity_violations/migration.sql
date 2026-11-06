-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'DISQUALIFIED';

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "violationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastViolationAt" TIMESTAMP(3),
ADD COLUMN     "disqualifiedAt" TIMESTAMP(3);
