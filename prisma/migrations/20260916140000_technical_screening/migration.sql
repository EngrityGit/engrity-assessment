-- AlterEnum
ALTER TYPE "Round" ADD VALUE 'TECHNICAL_SCREENING';

-- CreateTable
CREATE TABLE "TechnicalScreeningQuestion" (
    "id" TEXT NOT NULL,
    "role" "JobRole" NOT NULL,
    "topic" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "referenceAnswer" TEXT NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TechnicalScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalScreeningResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL DEFAULT '',
    "pointsAwarded" INTEGER,
    "feedback" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TechnicalScreeningResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalScreeningResponse_attemptId_questionId_key" ON "TechnicalScreeningResponse"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "TechnicalScreeningResponse" ADD CONSTRAINT "TechnicalScreeningResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalScreeningResponse" ADD CONSTRAINT "TechnicalScreeningResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TechnicalScreeningQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
