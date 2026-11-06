-- CreateTable
CREATE TABLE "CriticalThinkingResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "response" TEXT NOT NULL DEFAULT '',
    "scores" JSONB,
    "summary" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CriticalThinkingResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CriticalThinkingResponse_attemptId_scenarioId_key" ON "CriticalThinkingResponse"("attemptId", "scenarioId");

-- AddForeignKey
ALTER TABLE "CriticalThinkingResponse" ADD CONSTRAINT "CriticalThinkingResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalThinkingResponse" ADD CONSTRAINT "CriticalThinkingResponse_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "CriticalThinkingScenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
