import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasOpenAI } from "@/lib/llm";
import VoiceInterview from "@/components/VoiceInterview";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI interview" };

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE") redirect("/login");
  const { id } = await params;
  const iv = await prisma.interview.findUnique({ where: { id }, include: { candidate: true } });
  if (!iv || iv.candidateId !== session.user.candidateId) notFound();
  if (iv.status === "COMPLETED" || iv.status === "ABANDONED") redirect("/interview");
  if (iv.status === "PENDING" && iv.dueAt && iv.dueAt < new Date()) redirect("/interview");

  // The assistant widget is intentionally not rendered here.
  return (
    <div className="min-h-screen px-4 py-10">
      <VoiceInterview
        interviewId={iv.id}
        title={iv.title}
        firstName={iv.candidate.fullName.split(/\s+/)[0]}
        serverTts={hasOpenAI}
        serverStt={hasOpenAI}
      />
    </div>
  );
}
