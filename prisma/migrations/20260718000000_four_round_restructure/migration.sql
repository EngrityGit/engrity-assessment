-- Clear data from the old single-round test format (incompatible with the
-- new Round-based structure below — the app is being restructured from one
-- mixed test into 4 sequential rounds).
DELETE FROM "Answer";
DELETE FROM "Question";
DELETE FROM "Attempt";
DELETE FROM "Candidate";

-- CreateEnum
CREATE TYPE "Round" AS ENUM ('MATH', 'PERSONALITY', 'MEMORY', 'IQ');

-- CreateEnum
CREATE TYPE "PersonalityTrait" AS ENUM ('TEAMWORK', 'CONSCIENTIOUSNESS', 'STRESS_TOLERANCE', 'ADAPTABILITY', 'LEADERSHIP');

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "maxScore",
DROP COLUMN "score",
ADD COLUMN     "currentRound" "Round" NOT NULL DEFAULT 'MATH',
ADD COLUMN     "iqMax" INTEGER,
ADD COLUMN     "iqScore" INTEGER,
ADD COLUMN     "mathMax" INTEGER,
ADD COLUMN     "mathScore" INTEGER,
ADD COLUMN     "memoryAccuracyPct" INTEGER,
ADD COLUMN     "memoryAvgReactionMs" INTEGER,
ADD COLUMN     "memoryRaw" JSONB,
ADD COLUMN     "personalityRaw" JSONB,
ADD COLUMN     "personalityTraits" JSONB,
ADD COLUMN     "roundStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "category",
ADD COLUMN     "round" "Round" NOT NULL;

-- DropEnum
DROP TYPE "QuestionCategory";

-- CreateTable
CREATE TABLE "PersonalityQuestion" (
    "id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "trait" "PersonalityTrait" NOT NULL,
    "reverseScored" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PersonalityQuestion_pkey" PRIMARY KEY ("id")
);
