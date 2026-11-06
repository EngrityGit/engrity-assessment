import { requireRoundAttempt, roundMeta } from "@/lib/attemptGuard";
import type { MemoryTrial } from "@/lib/memory";
import MemoryRunner from "@/components/MemoryRunner";
import RoundWizard from "@/components/RoundWizard";
import ExamGuard from "@/components/ExamGuard";

export const dynamic = "force-dynamic";

export default async function MemoryPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const attempt = await requireRoundAttempt(attemptId, "MEMORY");
  const meta = roundMeta(attempt, "MEMORY");
  const sequence = (attempt.memorySequence as unknown as MemoryTrial[] | null) ?? [];

  if (!attempt.roundReady) {
    return <RoundWizard attemptId={attemptId} round="MEMORY" {...meta} questionCount={sequence.length} />;
  }

  // isRepeat / lag are the "answers" — never sent to the browser.
  const trials = sequence.map((t) => ({ index: t.index, stimulus: t.stimulus }));

  return (
    <ExamGuard watermark={meta.watermark}>
      <MemoryRunner attemptId={attemptId} candidateName={attempt.candidate.fullName} trials={trials} />
    </ExamGuard>
  );
}
