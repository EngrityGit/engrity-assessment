"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { IntegrityEventType } from "@/generated/prisma/client";
import type { IntegrityResult } from "@/lib/integrity";
import { applyIntegrityEvent } from "@/lib/integrity-server";

// Fire-and-forget from the client — deliberately quiet on failure (never
// blocks or disrupts the candidate's assessment). Ownership is still
// checked so one candidate can't log events against another's attempt.
export async function recordIntegrityEvent(
  attemptId: string,
  type: IntegrityEventType
): Promise<IntegrityResult> {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) {
    return { status: "ignored" };
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { candidateId: true },
  });
  if (!attempt || attempt.candidateId !== session.user.candidateId) {
    return { status: "ignored" };
  }

  return applyIntegrityEvent(attemptId, type);
}
