import { prisma } from "@/lib/prisma";
import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import { shuffledOptions } from "@/lib/shuffle";
import { submitIQRound } from "@/app/actions/attempt";
import TestRunner from "@/components/TestRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function IQPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "IQ");
  const meta = roundMeta(attempt, "IQ");
  const bank = await prisma.question.findMany({ where: { round: "IQ" }, orderBy: { order: "asc" } });

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="IQ" {...meta} questionCount={bank.length} />;
  }

  // IQ questions keep their authored difficulty order; only options are shuffled.
  const questions = bank.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: shuffledOptions(attemptId, q.id, q.options),
  }));

  return (
    <ExamGuard watermark={meta.watermark}>
      <TestRunner
        attemptId={attemptId}
        candidateName={attempt.candidate.fullName}
        questions={questions}
        deadline={meta.deadline}
        roundLabel={meta.roundLabel}
        submitLabel="Submit & Continue"
        submitAction={submitIQRound}
      />
    </ExamGuard>
  );
}
