import { prisma } from "@/lib/prisma";
import type { IntegrityEventType } from "@/generated/prisma/client";
import { MAX_WARNINGS, VIOLATION_CLUSTER_MS, COUNTS_TOWARD_WARNINGS, type IntegrityResult } from "@/lib/integrity";

// Logs one integrity event and applies the warning policy. No auth here —
// callers must have already verified the attempt belongs to the caller.
//
// Every event is logged for the admin report. Distinct incidents also count
// toward the candidate's warnings: the first MAX_WARNINGS get a warning, the
// next one terminates the attempt.
export async function applyIntegrityEvent(
  attemptId: string,
  type: IntegrityEventType
): Promise<IntegrityResult> {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) return { status: "ignored" };
  if (attempt.status === "DISQUALIFIED") return { status: "terminated" };
  if (attempt.status !== "IN_PROGRESS") return { status: "ignored" };

  await prisma.integrityEvent.create({
    data: { attemptId, type },
  });

  // Log-only signals never raise a warning.
  if (!COUNTS_TOWARD_WARNINGS.has(type)) {
    return { status: "logged", violations: attempt.violationCount };
  }

  // Atomic claim: when two events of one incident arrive together, only one
  // of them gets to increment the counter.
  const now = new Date();
  const cutoff = new Date(now.getTime() - VIOLATION_CLUSTER_MS);
  const claimed = await prisma.attempt.updateMany({
    where: {
      id: attemptId,
      status: "IN_PROGRESS",
      OR: [{ lastViolationAt: null }, { lastViolationAt: { lt: cutoff } }],
    },
    data: { violationCount: { increment: 1 }, lastViolationAt: now },
  });

  const fresh = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { violationCount: true, status: true },
  });
  if (!fresh) return { status: "ignored" };
  if (fresh.status === "DISQUALIFIED") return { status: "terminated" };

  if (claimed.count === 0) {
    return { status: "logged", violations: fresh.violationCount };
  }

  if (fresh.violationCount > MAX_WARNINGS) {
    await prisma.attempt.updateMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
      data: { status: "DISQUALIFIED", disqualifiedAt: now },
    });
    return { status: "terminated" };
  }

  return { status: "warned", violations: fresh.violationCount, max: MAX_WARNINGS };
}
