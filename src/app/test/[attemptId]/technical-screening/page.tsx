import { prisma } from "@/lib/prisma";
import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import { submitTechnicalScreeningRound } from "@/app/actions/attempt";
import TechnicalScreeningRunner from "@/components/TechnicalScreeningRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function TechnicalScreeningPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "TECHNICAL_SCREENING");
  const meta = roundMeta(attempt, "TECHNICAL_SCREENING");

  const rows = await prisma.technicalScreeningResponse.findMany({
    where: { attemptId },
    include: { question: true },
    orderBy: { order: "asc" },
  });

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="TECHNICAL_SCREENING" {...meta} questionCount={rows.length} />;
  }

  // referenceAnswer / correctIndex never leave the server.
  const questions = rows.map((r) => ({
    questionId: r.questionId,
    topic: r.question.topic,
    prompt: r.question.prompt,
    options: r.question.options,
  }));

  return (
    <ExamGuard watermark={meta.watermark}>
      <TechnicalScreeningRunner
        attemptId={attemptId}
        candidateName={attempt.candidate.fullName}
        questions={questions}
        deadline={meta.deadline}
        submitAction={submitTechnicalScreeningRound}
      />
    </ExamGuard>
  );
}
