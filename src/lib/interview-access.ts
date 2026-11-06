import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Shared guard for the interview API routes: the logged-in candidate must own
// the interview, and it must be open (not completed / abandoned / overdue).
export async function getOpenInterview(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const interview = await prisma.interview.findUnique({ where: { id }, include: { candidate: true } });
  if (!interview || interview.candidateId !== session.user.candidateId) return { error: "Not found", status: 404 as const };
  if (interview.status === "COMPLETED" || interview.status === "ABANDONED") return { error: "This interview is closed.", status: 409 as const };
  if (interview.status === "PENDING" && interview.dueAt && interview.dueAt < new Date()) return { error: "This interview is past its due date.", status: 403 as const };
  return { interview, session };
}
