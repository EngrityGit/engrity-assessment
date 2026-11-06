-- AlterTable
ALTER TABLE "TechnicalScreeningQuestion" ADD COLUMN     "options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "correctIndex" INTEGER;

-- AlterTable
ALTER TABLE "TechnicalScreeningResponse" ADD COLUMN     "selectedIndex" INTEGER;
