import { prisma } from "@/lib/prisma";
import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import { seededOrder } from "@/lib/shuffle";
import PersonalityRunner from "@/components/PersonalityRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function PersonalityPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "PERSONALITY");
  const meta = roundMeta(attempt, "PERSONALITY");
  const bank = await prisma.personalityQuestion.findMany({ orderBy: { order: "asc" } });

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="PERSONALITY" {...meta} questionCount={bank.length} />;
  }

  // Trait + reverse-scoring stay server-side; the browser only gets the statement.
  const questions = seededOrder(`${attemptId}:PERSONALITY`, bank).map((q) => ({ id: q.id, statement: q.statement }));

  return (
    <ExamGuard watermark={meta.watermark}>
      <PersonalityRunner
        attemptId={attemptId}
        candidateName={attempt.candidate.fullName}
        questions={questions}
        deadline={meta.deadline}
      />
    </ExamGuard>
  );
}
