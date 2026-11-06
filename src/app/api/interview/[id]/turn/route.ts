import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOpenInterview } from "@/lib/interview-access";
import { generateQuestion, evaluateInterview, type Criterion, type TranscriptEntry } from "@/lib/interview";
import type { Prisma } from "@/generated/prisma/client";

export const maxDuration = 120;

// One conversational turn. Body: { answer?: string, meta?: {...} }.
// With no answer it (re)starts or resumes: returns the pending question or asks the first one.
// Candidates only ever receive the next question — never scores or criteria.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await getOpenInterview(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { interview } = guard;

  let body: { answer?: string; meta?: { mode?: "voice" | "text"; delayMs?: number; durationMs?: number } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const criteria = interview.criteria as unknown as Criterion[];
  const transcript = (interview.transcript as unknown as TranscriptEntry[]) ?? [];
  const max = interview.maxQuestions;
  const now = new Date();
  const last = transcript[transcript.length - 1];

  if (interview.status === "PENDING") {
    await prisma.interview.update({ where: { id }, data: { status: "IN_PROGRESS", startedAt: now } });
  }

  // Record the candidate's answer (only valid directly after an AI question).
  const answer = typeof body.answer === "string" ? body.answer.trim().slice(0, 4000) : "";
  if (answer) {
    if (!last || last.role !== "ai") return NextResponse.json({ error: "Not expecting an answer." }, { status: 409 });
    const meta = body.meta ?? {};
    const clampMs = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(600000, Math.round(v))) : undefined);
    transcript.push({
      role: "candidate",
      text: answer,
      at: now.toISOString(),
      mode: meta.mode === "text" ? "text" : "voice",
      delayMs: clampMs(meta.delayMs),
      durationMs: clampMs(meta.durationMs),
      words: answer.split(/\s+/).filter(Boolean).length,
    });
  } else if (last && last.role === "ai") {
    // Resume: re-send the question that is still waiting for an answer.
    return NextResponse.json({ done: false, question: last.text, index: transcript.filter((e) => e.role === "ai").length - 1, total: max });
  }

  const asked = transcript.filter((e) => e.role === "ai").length;

  if (asked >= max) {
    // Final answer received — finish and score.
    await prisma.interview.update({ where: { id }, data: { transcript: transcript as unknown as Prisma.InputJsonValue } });
    const evalResult = await evaluateInterview({
      candidateName: interview.candidate.fullName,
      targetRole: interview.targetRole,
      criteria,
      focusNotes: interview.focusNotes,
      transcript,
      violationCount: interview.violationCount,
    });
    await prisma.interview.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        transcript: transcript as unknown as Prisma.InputJsonValue,
        scores: evalResult ? (evalResult.scores as unknown as Prisma.InputJsonValue) : undefined,
        overallScore: evalResult?.overall,
        recommendation: evalResult?.recommendation,
        summary: evalResult ? (evalResult.summary as unknown as Prisma.InputJsonValue) : undefined,
        selfRating: evalResult?.summary.selfRating ?? undefined,
        expectations: evalResult ? (evalResult.summary.expectations as unknown as Prisma.InputJsonValue) : undefined,
        providers: evalResult?.providers,
      },
    });
    return NextResponse.json({ done: true });
  }

  const q = await generateQuestion({
    candidateName: interview.candidate.fullName,
    targetRole: interview.targetRole,
    focusNotes: interview.focusNotes,
    criteria,
    transcript,
    index: asked,
    max,
  });
  const text = q?.text ?? "Please tell me more about your experience.";
  transcript.push({ role: "ai", text, at: new Date().toISOString() });
  await prisma.interview.update({ where: { id }, data: { transcript: transcript as unknown as Prisma.InputJsonValue } });

  return NextResponse.json({ done: false, question: text, index: asked, total: max });
}
