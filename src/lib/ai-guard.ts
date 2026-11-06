import { prisma } from "@/lib/prisma";

// The AI helpers are for learning and admin work — never while a candidate is
// inside a live assessment or interview. Enforced here, server-side, so
// opening another tab or calling the API directly doesn't get around it.
export async function candidateIsInExam(candidateId: string | null | undefined): Promise<boolean> {
  if (!candidateId) return false;
  const [attempt, interview] = await Promise.all([
    prisma.attempt.findFirst({ where: { candidateId, status: "IN_PROGRESS" }, select: { id: true } }),
    prisma.interview.findFirst({ where: { candidateId, status: "IN_PROGRESS" }, select: { id: true } }),
  ]);
  return Boolean(attempt || interview);
}

const HOURLY_LIMIT = Number(process.env.AI_HOURLY_LIMIT ?? 40);

export async function consumeAiQuota(userId: string, feature: string, provider?: string | null) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const used = await prisma.aiUsage.count({ where: { userId, createdAt: { gte: since } } });
  if (used >= HOURLY_LIMIT) return false;
  await prisma.aiUsage.create({ data: { userId, feature, provider: provider ?? null } });
  return true;
}
