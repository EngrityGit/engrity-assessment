"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobRole } from "@/generated/prisma/client";
import type { Prisma, IntegrityEventType } from "@/generated/prisma/client";
import { DEFAULT_CRITERIA, DEFAULT_MAX_QUESTIONS, evaluateInterview, type Criterion, type TranscriptEntry } from "@/lib/interview";
import { MAX_WARNINGS, VIOLATION_CLUSTER_MS, COUNTS_TOWARD_WARNINGS, type IntegrityResult } from "@/lib/integrity";
import { sendInterviewAssignedEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  return session;
}

export async function createInterviews(formData: FormData) {
  await requireAdmin();
  const ids = formData.getAll("candidateId").map(String).filter(Boolean);
  if (ids.length === 0) redirect("/admin/interviews?error=Choose+at+least+one+candidate.");

  const criteria: Criterion[] = DEFAULT_CRITERIA.map((c) => {
    const w = Number(formData.get(`w_${c.key}`));
    return { ...c, weight: Number.isFinite(w) ? Math.max(0, Math.min(100, w)) : c.weight };
  }).filter((c) => c.weight > 0);
  const customLabel = String(formData.get("customLabel") ?? "").trim().slice(0, 60);
  if (customLabel) {
    criteria.push({
      key: "custom",
      label: customLabel,
      weight: Math.max(1, Math.min(100, Number(formData.get("customWeight")) || 15)),
      description: String(formData.get("customDescription") ?? "").trim().slice(0, 300) || customLabel,
    });
  }
  if (criteria.length === 0) redirect("/admin/interviews?error=Keep+at+least+one+criterion+with+a+weight.");

  const roleRaw = String(formData.get("targetRole") ?? "");
  const maxRaw = Number(formData.get("maxQuestions"));
  const dueRaw = String(formData.get("dueAt") ?? "");
  const base = await getBaseUrl();

  const candidates = await prisma.candidate.findMany({ where: { id: { in: ids } } });
  for (const c of candidates) {
    const role = roleRaw in JobRole ? (roleRaw as JobRole) : c.targetRole;
    const interview = await prisma.interview.create({
      data: {
        candidateId: c.id,
        title: String(formData.get("title") ?? "").trim().slice(0, 100) || "Technical screening interview",
        targetRole: role,
        criteria: criteria as unknown as Prisma.InputJsonValue,
        focusNotes: String(formData.get("focusNotes") ?? "").trim().slice(0, 1000) || null,
        maxQuestions: Number.isFinite(maxRaw) ? Math.max(8, Math.min(20, Math.floor(maxRaw))) : DEFAULT_MAX_QUESTIONS,
        dueAt: dueRaw ? new Date(dueRaw) : null,
      },
    });
    await sendInterviewAssignedEmail({ to: c.email, fullName: c.fullName, url: `${base}/interview/${interview.id}`, dueAt: interview.dueAt });
  }
  revalidatePath("/admin/interviews");
  redirect(`/admin/interviews?created=${candidates.length}`);
}

export async function resetInterview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.interview.update({
    where: { id },
    data: {
      status: "PENDING", transcript: [], startedAt: null, completedAt: null, scores: undefined, overallScore: null,
      recommendation: null, summary: undefined, selfRating: null, expectations: undefined, providers: null, integrity: undefined, violationCount: 0,
    },
  });
  revalidatePath(`/admin/interviews/${id}`);
  redirect(`/admin/interviews/${id}?reset=1`);
}

export async function reevaluateInterview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const iv = await prisma.interview.findUnique({ where: { id }, include: { candidate: true } });
  if (!iv) redirect("/admin/interviews");
  const result = await evaluateInterview({
    candidateName: iv.candidate.fullName,
    targetRole: iv.targetRole,
    criteria: iv.criteria as unknown as Criterion[],
    focusNotes: iv.focusNotes,
    transcript: iv.transcript as unknown as TranscriptEntry[],
    violationCount: iv.violationCount,
  });
  if (result) {
    await prisma.interview.update({
      where: { id },
      data: {
        scores: result.scores as unknown as Prisma.InputJsonValue, overallScore: result.overall, recommendation: result.recommendation,
        summary: result.summary as unknown as Prisma.InputJsonValue, selfRating: result.summary.selfRating ?? undefined,
        expectations: result.summary.expectations as unknown as Prisma.InputJsonValue, providers: result.providers,
        status: iv.status === "ABANDONED" ? iv.status : "COMPLETED", completedAt: iv.completedAt ?? new Date(),
      },
    });
  }
  revalidatePath(`/admin/interviews/${id}`);
  redirect(`/admin/interviews/${id}?${result ? "evaluated=1" : "evalfailed=1"}`);
}

export async function deleteInterview(formData: FormData) {
  await requireAdmin();
  await prisma.interview.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/interviews");
  redirect("/admin/interviews?deleted=1");
}

// Candidate-side integrity events for a live interview (same 3-warning policy as the tests).
export async function recordInterviewIntegrity(interviewId: string, type: IntegrityEventType): Promise<IntegrityResult> {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE") return { status: "ignored" };
  const iv = await prisma.interview.findUnique({ where: { id: interviewId } });
  if (!iv || iv.candidateId !== session.user.candidateId || iv.status !== "IN_PROGRESS") return { status: "ignored" };

  const log = ((iv.integrity as unknown as { type: string; at: string; counted: boolean }[] | null) ?? []).slice(-200);
  const now = Date.now();
  const lastCounted = [...log].reverse().find((e) => e.counted);
  const counts = COUNTS_TOWARD_WARNINGS.has(type) && !(lastCounted && now - new Date(lastCounted.at).getTime() < VIOLATION_CLUSTER_MS);
  log.push({ type, at: new Date(now).toISOString(), counted: counts });

  const violations = iv.violationCount + (counts ? 1 : 0);
  const terminated = counts && violations > MAX_WARNINGS;
  await prisma.interview.update({
    where: { id: interviewId },
    data: { integrity: log as unknown as Prisma.InputJsonValue, violationCount: violations, ...(terminated ? { status: "ABANDONED" } : {}) },
  });
  if (terminated) return { status: "terminated" };
  return counts ? { status: "warned", violations, max: MAX_WARNINGS } : { status: "logged", violations };
}
