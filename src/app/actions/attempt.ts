"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { JobRole, Prisma } from "@/generated/prisma/client";
import { PERSONALITY_TRAITS, isRoundExpired, roundPath, type RoundName } from "@/lib/quiz";
import { promptLabel } from "@/lib/matrix";
import { originalIndex } from "@/lib/shuffle";
import type { TypingStats } from "@/lib/ai";
import { generateSequence, summarizeMemoryResults, type MemoryTrial, type MemoryTrialResult } from "@/lib/memory";
import {
  generatePersonalityNarrative,
  generateIQAnalysis,
  gradeCriticalThinkingResponse,
  gradeTechnicalScreeningResponse,
} from "@/lib/ai";

async function requireCandidateSession() {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) {
    redirect("/login");
  }
  return session;
}

async function requireOwnedAttempt(attemptId: string, candidateId: string) {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.candidateId !== candidateId) {
    redirect("/dashboard");
  }
  // A terminated attempt can't be continued, even by replaying a submit request.
  if (attempt!.status === "DISQUALIFIED") redirect(`/test/${attemptId}/disqualified`);
  return attempt!;
}

// Re-checked at submit time (in addition to the page-load check in
// attemptGuard.ts) to close the race where a request is in flight right at
// the deadline. Discards the submission rather than grading a late attempt.
async function rejectIfExpired(attempt: { id: string; roundStartedAt: Date; currentRound: RoundName; roundReady: boolean }) {
  // The round clock only runs after the wizard's Start button; a submit that
  // skips it is bounced back to the wizard.
  if (!attempt.roundReady) redirect(`/test/${attempt.id}/${roundPath(attempt.currentRound)}`);
  if (isRoundExpired(attempt.roundStartedAt, attempt.currentRound)) {
    await prisma.attempt.update({ where: { id: attempt.id }, data: { status: "EXPIRED" } });
    redirect(`/test/${attempt.id}/expired`);
  }
}

// Pressed at the end of the pre-round wizard: starts the round clock.
export async function beginRound(attemptId: string) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.status !== "IN_PROGRESS") redirect("/dashboard");

  if (!attempt.roundReady) {
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { roundReady: true, roundStartedAt: new Date() },
    });
  }
  redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
}

// Called from the dashboard's "Start"/"Resume" button for an assignment the
// candidate already owns. Creates the Attempt on first click; on later
// clicks (resume), just routes back into wherever the attempt left off.
export async function startAssignedAttempt(formData: FormData) {
  const session = await requireCandidateSession();
  const assignmentId = String(formData.get("assignmentId") ?? "");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { attempts: true },
  });
  if (!assignment || assignment.candidateId !== session.user.candidateId) {
    redirect("/dashboard");
  }

  const existing = assignment!.attempts[0];
  if (existing) {
    if (existing.status === "SUBMITTED") redirect("/thank-you");
    if (existing.status === "EXPIRED") redirect("/dashboard");
    if (existing.status === "DISQUALIFIED") redirect(`/test/${existing.id}/disqualified`);
    redirect(`/test/${existing.id}/${roundPath(existing.currentRound)}`);
  }

  // Technical-screening-only assignment: skip the core rounds and open the
  // role exam directly. The round clock starts now (first click), not when the
  // assignment was created.
  if (assignment!.technicalOnly) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: session.user.candidateId! },
      select: { targetRole: true },
    });
    const questions = await pickTechnicalScreeningQuestions(candidate?.targetRole ?? null);
    if (questions.length === 0) redirect("/dashboard");

    const attempt = await prisma.attempt.create({
      data: {
        candidateId: session.user.candidateId!,
        assignmentId: assignment!.id,
        currentRound: "TECHNICAL_SCREENING",
        technicalScreeningResponses: {
          create: questions.map((q, i) => ({ questionId: q.id, order: i })),
        },
      },
    });
    redirect(`/test/${attempt.id}/technical-screening`);
  }

  const attempt = await prisma.attempt.create({
    data: {
      candidateId: session.user.candidateId!,
      assignmentId: assignment!.id,
    },
  });

  redirect(`/test/${attempt.id}/math`);
}

async function gradeMcqRound(
  attemptId: string,
  round: "MATH" | "IQ",
  answers: { questionId: string; selectedIndex: number | null }[]
) {
  const questions = await prisma.question.findMany({ where: { round } });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  const answerRows = answers
    .filter((a) => questionMap.has(a.questionId))
    .map((a) => {
      const question = questionMap.get(a.questionId)!;
      // Options were shuffled per attempt; map the clicked position back.
      const selectedIndex = originalIndex(attemptId, question.id, question.options.length, a.selectedIndex);
      const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;
      if (isCorrect) score += 1;
      return {
        attemptId,
        questionId: a.questionId,
        selectedIndex,
        isCorrect,
      };
    });

  await prisma.answer.deleteMany({
    where: { attemptId, question: { round } },
  });
  await prisma.answer.createMany({ data: answerRows });

  return { score, max: questions.length };
}

export async function submitMathRound(
  attemptId: string,
  answers: { questionId: string; selectedIndex: number | null }[]
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.currentRound !== "MATH") redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  const { score, max } = await gradeMcqRound(attemptId, "MATH", answers);

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      mathScore: score,
      mathMax: max,
      currentRound: "PERSONALITY",
      roundReady: false,
      roundStartedAt: new Date(),
    },
  });

  redirect(`/test/${attemptId}/personality`);
}

export async function submitPersonalityRound(
  attemptId: string,
  answers: { questionId: string; value: number }[]
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.currentRound !== "PERSONALITY")
    redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  // Re-derive trait/reverseScored server-side from the question bank rather
  // than trusting client-supplied labels.
  const questions = await prisma.personalityQuestion.findMany();
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const byTrait: Record<string, number[]> = {};
  const rawForStorage: { questionId: string; value: number }[] = [];
  for (const a of answers) {
    const question = questionMap.get(a.questionId);
    if (!question) continue;
    const raw = question.reverseScored ? 6 - a.value : a.value;
    byTrait[question.trait] ??= [];
    byTrait[question.trait].push(raw);
    rawForStorage.push({ questionId: a.questionId, value: a.value });
  }

  const traitScores: Record<string, number> = {};
  for (const trait of PERSONALITY_TRAITS) {
    const values = byTrait[trait] ?? [];
    if (values.length === 0) continue;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    traitScores[trait] = Math.round((((avg - 1) / 4) * 10 + Number.EPSILON) * 10) / 10;
  }

  // Generate the memory round's sequence server-side now, so the client
  // never controls its own "truth" — it just plays back what's stored here.
  const memorySequence: MemoryTrial[] = generateSequence();

  // Non-blocking: a missing/failed AI call must never hold up the round
  // transition. personalitySummary stays null (shown as "Not yet analyzed")
  // rather than erroring.
  const personalitySummary = await generatePersonalityNarrative(traitScores);

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      personalityTraits: traitScores,
      personalityRaw: rawForStorage,
      personalitySummary: (personalitySummary as unknown as Prisma.InputJsonValue) ?? undefined,
      memorySequence,
      currentRound: "MEMORY",
      roundReady: false,
      roundStartedAt: new Date(),
    },
  });

  redirect(`/test/${attemptId}/memory`);
}

export async function submitMemoryRound(
  attemptId: string,
  submission: {
    results: { index: number; respondedSeen: boolean; reactionMs: number | null }[];
  }
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.currentRound !== "MEMORY")
    redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  const sequence = (attempt.memorySequence as unknown as MemoryTrial[] | null) ?? [];
  const trialByIndex = new Map(sequence.map((t) => [t.index, t]));

  // Re-derive isRepeat/correct from the server-stored sequence — the client
  // only ever reported respondedSeen/reactionMs, never the "truth".
  const fullResults: MemoryTrialResult[] = submission.results
    .filter((r) => trialByIndex.has(r.index))
    .map((r) => {
      const trial = trialByIndex.get(r.index)!;
      return {
        index: r.index,
        isRepeat: trial.isRepeat,
        respondedSeen: r.respondedSeen,
        correct: trial.isRepeat === r.respondedSeen,
        reactionMs: r.reactionMs,
      };
    });

  const { accuracyPct, avgReactionMs } = summarizeMemoryResults(fullResults);

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      memoryAccuracyPct: accuracyPct,
      memoryAvgReactionMs: avgReactionMs,
      memoryRaw: fullResults,
      currentRound: "IQ",
      roundReady: false,
      roundStartedAt: new Date(),
    },
  });

  redirect(`/test/${attemptId}/iq`);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Client telemetry is untrusted — clamp it to sane numbers.
function sanitizeTyping(t: TypingStats | undefined | null): TypingStats | null {
  if (!t) return null;
  const n = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);
  return { keystrokes: n(t.keystrokes, 100000), chars: n(t.chars, 100000), pasteBlocked: n(t.pasteBlocked, 1000), activeMs: n(t.activeMs, 36000000) };
}

const CRITICAL_THINKING_QUESTION_COUNT = 3;

// Prefers role-matched scenarios, fills the rest from generic ones, and
// never repeats a scenario within the same attempt. Degrades gracefully to
// fewer than `count` if the bank doesn't have enough distinct scenarios.
async function pickCriticalThinkingScenarios(targetRole: JobRole | null, count = CRITICAL_THINKING_QUESTION_COUNT) {
  const [roleScenarios, genericScenarios] = await Promise.all([
    targetRole
      ? prisma.criticalThinkingScenario.findMany({ where: { role: targetRole } })
      : Promise.resolve([]),
    prisma.criticalThinkingScenario.findMany({ where: { role: null } }),
  ]);

  const pool = [...shuffle(roleScenarios), ...shuffle(genericScenarios)];
  const seen = new Set<string>();
  const picked = [];
  for (const s of pool) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    picked.push(s);
    if (picked.length === count) break;
  }
  return picked;
}

// Fetches every TechnicalScreeningQuestion for the role — comprehensive,
// not sampled, unlike pickCriticalThinkingScenarios — since this round is
// meant to be a full technical exam for roles that have one.
async function pickTechnicalScreeningQuestions(targetRole: JobRole | null) {
  if (!targetRole) return [];
  return prisma.technicalScreeningQuestion.findMany({
    where: { role: targetRole },
    orderBy: { order: "asc" },
  });
}

// Called at the end of Critical Thinking grading (both the legacy and
// multi-question branches below). Role-conditional: if the candidate's
// target role has Technical Screening questions, advance into that round
// instead of finishing the assessment; otherwise finalize exactly as
// before (status SUBMITTED + Certificate + redirect to /thank-you).
async function finalizeOrAdvanceToTechnicalScreening(
  attemptId: string,
  candidateId: string,
  targetRole: JobRole | null
) {
  const questions = await pickTechnicalScreeningQuestions(targetRole);

  if (questions.length > 0) {
    await prisma.$transaction([
      prisma.attempt.update({
        where: { id: attemptId },
        data: { currentRound: "TECHNICAL_SCREENING", roundReady: false, roundStartedAt: new Date() },
      }),
      prisma.technicalScreeningResponse.createMany({
        data: questions.map((q, i) => ({ attemptId, questionId: q.id, order: i })),
      }),
    ]);
    redirect(`/test/${attemptId}/technical-screening`);
  }

  await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await prisma.certificate.create({
    data: {
      candidateId,
      attemptId,
      verificationCode: randomBytes(12).toString("base64url"),
    },
  });

  revalidatePath("/dashboard");
  redirect("/thank-you");
}

export async function submitIQRound(
  attemptId: string,
  answers: { questionId: string; selectedIndex: number | null }[]
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.status === "SUBMITTED") redirect("/thank-you");
  if (attempt.currentRound !== "IQ") redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  const { score, max } = await gradeMcqRound(attemptId, "IQ", answers);

  const questions = await prisma.question.findMany({ where: { round: "IQ" } });
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const gradedAnswers = answers
    .filter((a) => questionMap.has(a.questionId))
    .map((a) => {
      const q = questionMap.get(a.questionId)!;
      return { prompt: promptLabel(q.prompt), isCorrect: a.selectedIndex === q.correctIndex };
    });

  // Non-blocking, same as the personality narrative — never holds up the
  // round transition.
  const iqSummary = await generateIQAnalysis(score, max, gradedAnswers);

  const candidate = await prisma.candidate.findUnique({
    where: { id: attempt.candidateId },
    select: { targetRole: true },
  });
  const scenarios = await pickCriticalThinkingScenarios(candidate?.targetRole ?? null);

  await prisma.$transaction([
    prisma.attempt.update({
      where: { id: attemptId },
      data: {
        iqScore: score,
        iqMax: max,
        iqSummary: (iqSummary as unknown as Prisma.InputJsonValue) ?? undefined,
        currentRound: "CRITICAL_THINKING",
        roundReady: false,
        roundStartedAt: new Date(),
      },
    }),
    prisma.criticalThinkingResponse.createMany({
      data: scenarios.map((s, i) => ({ attemptId, scenarioId: s.id, order: i })),
    }),
  ]);

  redirect(`/test/${attemptId}/critical-thinking`);
}

const CT_SCORE_DIMENSIONS = [
  "decisionMaking",
  "safetyAwareness",
  "riskAssessment",
  "communication",
  "problemSolving",
] as const;

export async function submitCriticalThinkingRound(
  attemptId: string,
  responses: { scenarioId: string; response: string; typing?: TypingStats }[]
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.status === "SUBMITTED") redirect("/thank-you");
  if (attempt.currentRound !== "CRITICAL_THINKING")
    redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  const assigned = await prisma.criticalThinkingResponse.findMany({
    where: { attemptId },
    include: { scenario: true },
  });

  const candidate = await prisma.candidate.findUnique({
    where: { id: attempt.candidateId },
    select: { targetRole: true },
  });

  // Legacy fallback: an attempt that entered CRITICAL_THINKING before this
  // table existed has no rows here — grade its single response directly
  // into the old singular fields, same as the pre-multi-question flow.
  if (assigned.length === 0) {
    const trimmedResponse = (responses[0]?.response ?? "").trim().slice(0, 8000);
    let criticalThinkingScores: Record<string, number> | undefined;
    let criticalThinkingSummary: string | undefined;

    if (attempt.criticalThinkingScenarioId && trimmedResponse.length > 0) {
      const scenario = await prisma.criticalThinkingScenario.findUnique({
        where: { id: attempt.criticalThinkingScenarioId },
      });
      if (scenario) {
        const grade = await gradeCriticalThinkingResponse(
          scenario.prompt,
          trimmedResponse,
          candidate?.targetRole ?? null
        );
        if (grade) {
          criticalThinkingScores = grade.scores;
          criticalThinkingSummary = grade.summary;
        }
      }
    }

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        criticalThinkingResponse: trimmedResponse,
        criticalThinkingScores: (criticalThinkingScores as unknown as Prisma.InputJsonValue) ?? undefined,
        criticalThinkingSummary,
      },
    });

    await finalizeOrAdvanceToTechnicalScreening(attempt.id, attempt.candidateId, candidate?.targetRole ?? null);
    return;
  }

  const assignedById = new Map(assigned.map((a) => [a.scenarioId, a]));

  const graded = await Promise.all(
    responses
      .filter((r) => assignedById.has(r.scenarioId))
      .map(async (r) => {
        const row = assignedById.get(r.scenarioId)!;
        const trimmedResponse = r.response.trim().slice(0, 8000);
        let grade: Awaited<ReturnType<typeof gradeCriticalThinkingResponse>> = null;
        const typing = sanitizeTyping(r.typing);
        if (trimmedResponse.length > 0) {
          grade = await gradeCriticalThinkingResponse(
            row.scenario.prompt,
            trimmedResponse,
            candidate?.targetRole ?? null,
            typing
          );
        }
        return { id: row.id, response: trimmedResponse, grade, typing };
      })
  );

  await prisma.$transaction(
    graded.map((g) =>
      prisma.criticalThinkingResponse.update({
        where: { id: g.id },
        data: {
          response: g.response,
          scores: (g.grade?.scores as unknown as Prisma.InputJsonValue) ?? undefined,
          summary: g.grade?.summary,
          typingStats: (g.typing as unknown as Prisma.InputJsonValue) ?? undefined,
          authenticity: (g.grade?.authenticity as unknown as Prisma.InputJsonValue) ?? undefined,
        },
      })
    )
  );

  // Aggregate per-dimension averages across whichever responses graded
  // successfully, written into the legacy singular field so
  // computeOverallScore (src/lib/quiz.ts) needs no changes.
  const gradedScores = graded.map((g) => g.grade?.scores).filter((s): s is NonNullable<typeof s> => !!s);
  let aggregateScores: Record<string, number> | undefined;
  if (gradedScores.length > 0) {
    aggregateScores = {};
    for (const dim of CT_SCORE_DIMENSIONS) {
      const values = gradedScores.map((s) => s[dim]).filter((v): v is number => typeof v === "number");
      if (values.length > 0) {
        aggregateScores[dim] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      }
    }
  }

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      criticalThinkingScores: (aggregateScores as unknown as Prisma.InputJsonValue) ?? undefined,
    },
  });

  await finalizeOrAdvanceToTechnicalScreening(attempt.id, attempt.candidateId, candidate?.targetRole ?? null);
}

const TS_MAX_RESPONSE_LENGTH = 2000;

export async function submitTechnicalScreeningRound(
  attemptId: string,
  responses: { questionId: string; response: string; selectedIndex: number | null; typing?: TypingStats }[]
) {
  const session = await requireCandidateSession();
  const attempt = await requireOwnedAttempt(attemptId, session.user.candidateId!);
  if (attempt.status === "SUBMITTED") redirect("/thank-you");
  if (attempt.currentRound !== "TECHNICAL_SCREENING")
    redirect(`/test/${attemptId}/${roundPath(attempt.currentRound)}`);
  await rejectIfExpired(attempt);

  const assigned = await prisma.technicalScreeningResponse.findMany({
    where: { attemptId },
    include: { question: true },
  });
  const assignedById = new Map(assigned.map((a) => [a.questionId, a]));

  const candidate = await prisma.candidate.findUnique({
    where: { id: attempt.candidateId },
    select: { targetRole: true },
  });

  const graded = await Promise.all(
    responses
      .filter((r) => assignedById.has(r.questionId))
      .map(async (r) => {
        const row = assignedById.get(r.questionId)!;

        // Multiple-choice questions (options populated) grade deterministically,
        // same as gradeMcqRound for MATH/IQ — no AI call needed.
        if (row.question.options.length > 0) {
          const selectedIndex =
            r.selectedIndex !== null && r.selectedIndex >= 0 && r.selectedIndex < row.question.options.length
              ? r.selectedIndex
              : null;
          const isCorrect = selectedIndex !== null && selectedIndex === row.question.correctIndex;
          return {
            id: row.id,
            response: "",
            selectedIndex,
            pointsAwarded: isCorrect ? row.question.maxPoints : 0,
            feedback: null as string | null,
            typing: null as TypingStats | null,
            authenticity: null,
          };
        }

        // Free-text questions grade via AI against the reference answer.
        const trimmedResponse = r.response.trim().slice(0, TS_MAX_RESPONSE_LENGTH);
        let grade: Awaited<ReturnType<typeof gradeTechnicalScreeningResponse>> = null;
        // maxPoints 0 = recorded for the reviewer but not scored (e.g.
        // compensation expectations), so no AI call is needed.
        if (trimmedResponse.length > 0 && row.question.maxPoints > 0) {
          grade = await gradeTechnicalScreeningResponse(
            row.question.prompt,
            row.question.referenceAnswer,
            row.question.maxPoints,
            trimmedResponse,
            candidate?.targetRole ?? null,
            sanitizeTyping(r.typing)
          );
        }
        return {
          id: row.id,
          response: trimmedResponse,
          selectedIndex: null,
          pointsAwarded: grade?.pointsAwarded,
          feedback: grade?.feedback ?? null,
          typing: sanitizeTyping(r.typing),
          authenticity: grade?.authenticity ?? null,
        };
      })
  );

  await prisma.$transaction(
    graded.map((g) =>
      prisma.technicalScreeningResponse.update({
        where: { id: g.id },
        data: {
          response: g.response,
          selectedIndex: g.selectedIndex,
          pointsAwarded: g.pointsAwarded,
          feedback: g.feedback,
          typingStats: (g.typing as unknown as Prisma.InputJsonValue) ?? undefined,
          authenticity: (g.authenticity as unknown as Prisma.InputJsonValue) ?? undefined,
        },
      })
    )
  );

  await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await prisma.certificate.create({
    data: {
      candidateId: attempt.candidateId,
      attemptId: attempt.id,
      verificationCode: randomBytes(12).toString("base64url"),
    },
  });

  revalidatePath("/dashboard");
  redirect("/thank-you");
}
