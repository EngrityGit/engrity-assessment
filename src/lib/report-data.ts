import { prisma } from "@/lib/prisma";
import { computeOverallScore, computeIQIndex, deriveFitVerdict } from "@/lib/quiz";
import { derivePersonalityArchetype } from "@/lib/personality-archetype";
import type { MemoryTrialResult } from "@/lib/memory";
import type { PersonalitySummary, IQSummary, Authenticity, TypingStats } from "@/lib/ai";
import { INTEGRITY_WEIGHTS } from "@/lib/integrity";

export const INTEGRITY_LABELS: Record<string, string> = {
  TAB_HIDDEN: "Switched tabs / minimized",
  WINDOW_BLUR: "Left the window",
  COPY: "Copied text",
  PASTE: "Pasted text",
  CUT: "Cut text",
  FULLSCREEN_EXIT: "Left full screen",
  CONTEXT_MENU: "Right-click attempts",
  BLOCKED_SHORTCUT: "Blocked keyboard shortcuts",
  DEVTOOLS: "Possible dev-tools / split window",
  BULK_INPUT: "Text appeared faster than typing",
};

export const CT_DIMENSION_LABELS: Record<string, string> = {
  decisionMaking: "Decision Making",
  safetyAwareness: "Safety Awareness",
  riskAssessment: "Risk Assessment",
  communication: "Communication",
  problemSolving: "Problem Solving",
};

export interface InterviewQuestionItem {
  scenarioId: string;
  prompt: string;
  response: string | null;
  scores: Record<string, number> | null;
  summary: string | null;
  authenticity: Authenticity | null;
  typing: TypingStats | null;
}

export interface TechnicalScreeningItem {
  questionId: string;
  topic: string;
  prompt: string;
  referenceAnswer: string;
  response: string | null;
  options: string[];
  correctIndex: number | null;
  selectedIndex: number | null;
  pointsAwarded: number | null;
  maxPoints: number;
  feedback: string | null;
  authenticity: Authenticity | null;
  typing: TypingStats | null;
}

export interface TechnicalScreeningScore {
  pointsAwarded: number;
  maxPoints: number;
  pct: number;
}

export async function getAttemptReportData(id: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      candidate: true,
      answers: { include: { question: true } },
      integrityEvents: { orderBy: { occurredAt: "desc" } },
      criticalThinkingResponses: {
        include: { scenario: true },
        orderBy: { order: "asc" },
      },
      technicalScreeningResponses: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!attempt) return null;

  const integrityCounts = attempt.integrityEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const mathAnswers = attempt.answers.filter((a) => a.question.round === "MATH");
  const iqAnswers = attempt.answers.filter((a) => a.question.round === "IQ");

  const traitScores = (attempt.personalityTraits as Record<string, number> | null) ?? {};
  const personalitySummary = attempt.personalitySummary as PersonalitySummary | null;
  const iqSummary = attempt.iqSummary as IQSummary | null;
  const criticalThinkingScores = attempt.criticalThinkingScores as Record<string, number> | null;

  // Legacy fallback for attempts submitted before the multi-question
  // Critical Thinking round existed — they only have the old singular
  // scenario/response fields.
  let interviewQuestions: InterviewQuestionItem[] = attempt.criticalThinkingResponses.map((r) => ({
    scenarioId: r.scenarioId,
    prompt: r.scenario.prompt,
    response: r.response || null,
    scores: (r.scores as Record<string, number> | null) ?? null,
    summary: r.summary,
    authenticity: (r.authenticity as Authenticity | null) ?? null,
    typing: (r.typingStats as TypingStats | null) ?? null,
  }));
  if (interviewQuestions.length === 0 && attempt.criticalThinkingScenarioId) {
    const legacyScenario = await prisma.criticalThinkingScenario.findUnique({
      where: { id: attempt.criticalThinkingScenarioId },
    });
    if (legacyScenario) {
      interviewQuestions = [
        {
          scenarioId: legacyScenario.id,
          prompt: legacyScenario.prompt,
          response: attempt.criticalThinkingResponse,
          scores: criticalThinkingScores,
          summary: attempt.criticalThinkingSummary,
          authenticity: null,
          typing: null,
        },
      ];
    }
  }

  const overallScore = computeOverallScore({
    mathScore: attempt.mathScore,
    mathMax: attempt.mathMax,
    iqScore: attempt.iqScore,
    iqMax: attempt.iqMax,
    memoryAccuracyPct: attempt.memoryAccuracyPct,
    personalityTraits: attempt.personalityTraits,
    criticalThinkingScores: attempt.criticalThinkingScores,
  });

  const iqIndex = computeIQIndex(attempt.iqScore, attempt.iqMax);
  const personalityArchetype = derivePersonalityArchetype(traitScores);
  const fitVerdict = deriveFitVerdict(overallScore?.overall ?? null);

  const technicalScreeningQuestions: TechnicalScreeningItem[] = attempt.technicalScreeningResponses.map(
    (r) => ({
      questionId: r.questionId,
      topic: r.question.topic,
      prompt: r.question.prompt,
      referenceAnswer: r.question.referenceAnswer,
      response: r.response || null,
      options: r.question.options,
      correctIndex: r.question.correctIndex,
      selectedIndex: r.selectedIndex,
      pointsAwarded: r.pointsAwarded,
      maxPoints: r.question.maxPoints,
      feedback: r.feedback,
      authenticity: (r.authenticity as Authenticity | null) ?? null,
      typing: (r.typingStats as TypingStats | null) ?? null,
    })
  );
  let technicalScreeningScore: TechnicalScreeningScore | null = null;
  if (technicalScreeningQuestions.length > 0) {
    const maxPoints = technicalScreeningQuestions.reduce((sum, q) => sum + q.maxPoints, 0);
    const pointsAwarded = technicalScreeningQuestions.reduce(
      (sum, q) => sum + (q.pointsAwarded ?? 0),
      0
    );
    technicalScreeningScore = {
      pointsAwarded,
      maxPoints,
      pct: maxPoints > 0 ? Math.round((pointsAwarded / maxPoints) * 100) : 0,
    };
  }

  const memoryTrials = (attempt.memoryRaw as unknown as MemoryTrialResult[] | null) ?? [];
  const hits = memoryTrials.filter((t) => t.isRepeat && t.respondedSeen).length;
  const misses = memoryTrials.filter((t) => t.isRepeat && !t.respondedSeen).length;
  const falseAlarms = memoryTrials.filter((t) => !t.isRepeat && t.respondedSeen).length;
  const correctRejections = memoryTrials.filter((t) => !t.isRepeat && !t.respondedSeen).length;

  // Integrity risk: weighted count of signals plus AI-authenticity flags on written answers.
  const written = [...interviewQuestions, ...technicalScreeningQuestions];
  const likelyAi = written.filter((w) => (w.authenticity?.aiLikelihood ?? 0) >= 70).length;
  const lowKeystrokes = written.filter(
    (w) => w.typing && w.typing.chars > 80 && w.typing.keystrokes < w.typing.chars * 0.6
  ).length;
  const rawRisk =
    Object.entries(integrityCounts).reduce((sum, [type, n]) => sum + (INTEGRITY_WEIGHTS[type] ?? 5) * n, 0) +
    likelyAi * 20 +
    lowKeystrokes * 15 +
    attempt.violationCount * 5;
  const integrityRisk = {
    score: Math.min(100, rawRisk),
    level: rawRisk >= 60 ? "High" : rawRisk >= 25 ? "Medium" : "Low",
    likelyAi,
    lowKeystrokes,
  };

  return {
    attempt,
    integrityCounts,
    integrityRisk,
    mathAnswers,
    iqAnswers,
    traitScores,
    personalitySummary,
    iqSummary,
    criticalThinkingScores,
    interviewQuestions,
    technicalScreeningQuestions,
    technicalScreeningScore,
    overallScore,
    iqIndex,
    personalityArchetype,
    fitVerdict,
    memoryTrials,
    memoryStats: { hits, misses, falseAlarms, correctRejections },
  };
}

export type AttemptReportData = NonNullable<Awaited<ReturnType<typeof getAttemptReportData>>>;
