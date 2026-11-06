import { prisma } from "@/lib/prisma";
import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import { submitCriticalThinkingRound } from "@/app/actions/attempt";
import CriticalThinkingRunner from "@/components/CriticalThinkingRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function CriticalThinkingPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "CRITICAL_THINKING");
  const meta = roundMeta(attempt, "CRITICAL_THINKING");

  const rows = await prisma.criticalThinkingResponse.findMany({
    where: { attemptId },
    include: { scenario: true },
    orderBy: { order: "asc" },
  });
  let questions = rows.map((r) => ({ scenarioId: r.scenarioId, prompt: r.scenario.prompt }));

  // Legacy attempts predate the multi-question table.
  if (questions.length === 0 && attempt.criticalThinkingScenarioId) {
    const s = await prisma.criticalThinkingScenario.findUnique({ where: { id: attempt.criticalThinkingScenarioId } });
    if (s) questions = [{ scenarioId: s.id, prompt: s.prompt }];
  }

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="CRITICAL_THINKING" {...meta} questionCount={questions.length} />;
  }

  return (
    <ExamGuard watermark={meta.watermark}>
      <CriticalThinkingRunner
        attemptId={attemptId}
        candidateName={attempt.candidate.fullName}
        questions={questions}
        deadline={meta.deadline}
        submitAction={submitCriticalThinkingRound}
      />
    </ExamGuard>
  );
}
