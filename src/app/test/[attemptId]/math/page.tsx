import { prisma } from "@/lib/prisma";
import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import { seededOrder, shuffledOptions } from "@/lib/shuffle";
import { submitMathRound } from "@/app/actions/attempt";
import TestRunner from "@/components/TestRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function MathPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "MATH");
  const meta = roundMeta(attempt, "MATH");
  const bank = await prisma.question.findMany({ 
    where: { round: "MATH" }, 
    orderBy: { order: "asc" } 
  });

  // Guard: Check if questions exist in the database
  if (!bank || bank.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center text-slate-300">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">No Questions Found</h2>
          <p className="text-sm text-slate-400">
            There are no questions configured for the MATH round in the database. Please seed the database or contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="MATH" {...meta} questionCount={bank.length} />;
  }

  const questions = seededOrder(`${attemptId}:MATH`, bank).map((q) => ({
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
        submitAction={submitMathRound}
      />
    </ExamGuard>
  );
}