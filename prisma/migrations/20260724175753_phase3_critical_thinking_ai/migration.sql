-- CreateEnum
CREATE TYPE "JobRole" AS ENUM ('NDT', 'ROPE_ACCESS', 'QC_INSPECTION', 'CIVIL', 'WELDING', 'COATING', 'ELECTRICAL_INSTRUMENTATION', 'PROJECT_MANAGEMENT', 'GEOTECHNICAL');

-- AlterEnum
ALTER TYPE "Round" ADD VALUE 'CRITICAL_THINKING';

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "criticalThinkingResponse" TEXT,
ADD COLUMN     "criticalThinkingScenarioId" TEXT,
ADD COLUMN     "criticalThinkingScores" JSONB,
ADD COLUMN     "criticalThinkingSummary" TEXT,
ADD COLUMN     "iqSummary" JSONB,
ADD COLUMN     "personalitySummary" JSONB;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "targetRole" "JobRole";

-- CreateTable
CREATE TABLE "CriticalThinkingScenario" (
    "id" TEXT NOT NULL,
    "role" "JobRole",
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CriticalThinkingScenario_pkey" PRIMARY KEY ("id")
);

