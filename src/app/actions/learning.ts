"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ALL_LESSONS } from "@/lib/learning";
import { candidateIsInExam, consumeAiQuota } from "@/lib/ai-guard";
import { completeJSON, arrOf, int, obj, str, type Provider } from "@/lib/llm";
import type { GameKind } from "@/generated/prisma/client";

async function candidateId() {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) return null;
  return { userId: session.user.id, candidateId: session.user.candidateId };
}

export async function saveLessonProgress(lessonSlug: string, score: number | null, max: number | null, completed: boolean) {
  const who = await candidateId();
  if (!who || !ALL_LESSONS.some((l) => l.slug === lessonSlug)) return { ok: false };
  const lesson = ALL_LESSONS.find((l) => l.slug === lessonSlug)!;
  const safeMax = max === null ? null : Math.min(Math.max(0, Math.floor(max)), lesson.quiz.length);
  const safeScore = score === null || safeMax === null ? null : Math.min(Math.max(0, Math.floor(score)), safeMax);

  const existing = await prisma.lessonProgress.findUnique({
    where: { candidateId_lessonSlug: { candidateId: who.candidateId, lessonSlug } },
  });
  await prisma.lessonProgress.upsert({
    where: { candidateId_lessonSlug: { candidateId: who.candidateId, lessonSlug } },
    create: { candidateId: who.candidateId, lessonSlug, quizScore: safeScore, quizMax: safeMax, completedAt: completed ? new Date() : null },
    update: {
      // Keep the best quiz score; completion is sticky.
      quizScore: safeScore !== null && (existing?.quizScore ?? -1) < safeScore ? safeScore : existing?.quizScore,
      quizMax: safeMax ?? existing?.quizMax,
      completedAt: existing?.completedAt ?? (completed ? new Date() : null),
    },
  });
  revalidatePath("/learn");
  revalidatePath("/dashboard");
  return { ok: true };
}

const MAX_SCORE: Record<GameKind, number> = { SYMBOL_MATCH: 1000, SPEED_ROUND: 1500, ERROR_HUNT: 600 };

export async function saveGameScore(game: GameKind, score: number, maxScore: number, durationMs: number) {
  const who = await candidateId();
  if (!who || !(game in MAX_SCORE)) return { ok: false };
  // The score is computed in the browser, so clamp to what the game can award.
  const safe = Math.max(0, Math.min(MAX_SCORE[game], Math.floor(score)));
  await prisma.gameScore.create({
    data: { candidateId: who.candidateId, game, score: safe, maxScore: Math.floor(maxScore), durationMs: Math.max(0, Math.floor(durationMs)) },
  });
  revalidatePath("/learn/games");
  return { ok: true };
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// AI-generated practice questions. Disabled during live assessments.
export async function generatePractice(topic: string, difficulty: "easy" | "medium" | "hard", provider?: Provider): Promise<{ questions?: PracticeQuestion[]; error?: string }> {
  const who = await candidateId();
  if (!who) return { error: "Please log in." };
  if (await candidateIsInExam(who.candidateId)) return { error: "Practice is disabled while an assessment or interview is in progress." };
  if (!(await consumeAiQuota(who.userId, "practice"))) return { error: "You've reached the hourly AI limit. Try again later." };

  const cleanTopic = topic.trim().slice(0, 120);
  if (!cleanTopic) return { error: "Choose a topic." };

  const res = await completeJSON<{ questions: PracticeQuestion[] }>(
    {
      name: "submit_practice_questions",
      description: "Submit multiple-choice practice questions with explanations.",
      maxTokens: 2500,
      fast: true,
      schema: obj({
        questions: arrOf(
          obj({
            question: str("The question"),
            options: arrOf({ type: "string" }, "Exactly 4 plausible options"),
            correct: int("Zero-based index of the correct option"),
            explanation: str("1-3 sentence explanation of why the answer is right and common mistakes"),
          }),
          "Exactly 5 questions"
        ),
      }),
      system:
        "You write practice questions for inspection, NDT, welding, QA/QC and field-safety personnel in Western Canada. " +
        "Questions must be technically correct under common industry practice (ASME, API, CSA, ISA, CGSB/ISO 9712, Alberta OHS). " +
        "When something varies by code edition or project, say so in the explanation instead of asserting one value. " +
        "Use realistic field scenarios. Exactly 4 options each, one clearly correct. Vary the position of the correct option.",
      user: `Topic: ${cleanTopic}\nDifficulty: ${difficulty}\nWrite 5 questions.`,
    },
    provider
  );
  const qs = res?.data.questions?.filter(
    (q) => Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4
  );
  if (!qs || qs.length === 0) return { error: "The AI couldn't generate questions right now. Please try again." };
  return { questions: qs.slice(0, 5) };
}
