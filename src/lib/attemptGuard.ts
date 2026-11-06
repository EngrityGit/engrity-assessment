import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  isRoundExpired,
  roundPath,
  ROUND_ORDER,
  ROUND_LABELS,
  ROUND_TIME_LIMIT_MINUTES,
  type RoundName,
} from "@/lib/quiz";

export async function requireRoundAttempt(attemptId: string, round: RoundName) {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE") redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { candidate: true, assignment: true },
  });
  if (!attempt) notFound();
  if (attempt.candidateId !== session.user.candidateId) redirect("/dashboard");
  if (attempt.status === "SUBMITTED") redirect("/thank-you");
  if (attempt.status === "EXPIRED") redirect(`/test/${attemptId}/expired`);
  if (attempt.status === "DISQUALIFIED") redirect(`/test/${attemptId}/disqualified`);

  // The clock only runs once the candidate has pressed Start in the wizard.
  if (attempt.status === "IN_PROGRESS" && attempt.roundReady && isRoundExpired(attempt.roundStartedAt, attempt.currentRound)) {
    await prisma.attempt.update({ where: { id: attemptId }, data: { status: "EXPIRED" } });
    redirect(`/test/${attemptId}/expired`);
  }

  if (attempt.currentRound !== round) {
    redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  }
  return attempt;
}

type GuardedAttempt = Awaited<ReturnType<typeof requireRoundAttempt>>;

export function roundMeta(attempt: GuardedAttempt, round: RoundName) {
  const technicalOnly = attempt.assignment?.technicalOnly ?? false;
  const sequence: RoundName[] = technicalOnly ? ["TECHNICAL_SCREENING"] : [...ROUND_ORDER];
  const index = sequence.indexOf(round);
  return {
    roundLabel: ROUND_LABELS[round],
    minutes: ROUND_TIME_LIMIT_MINUTES[round],
    roundNumber: index >= 0 ? index + 1 : sequence.length + 1,
    // Technical screening is conditional for the standard flow, so say "+1" via total.
    roundTotal: technicalOnly ? 1 : round === "TECHNICAL_SCREENING" ? ROUND_ORDER.length + 1 : ROUND_ORDER.length,
    deadline: new Date(attempt.roundStartedAt.getTime() + ROUND_TIME_LIMIT_MINUTES[round] * 60_000).toISOString(),
    watermark: `${attempt.candidate.email} · ${attempt.id.slice(-6)}`,
  };
}
