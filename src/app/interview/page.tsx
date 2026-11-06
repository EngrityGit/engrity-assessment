import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";

export const metadata = { title: "Interviews" };

export default async function InterviewListPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/interviews");
  const items = await prisma.interview.findMany({ where: { candidateId: session.user.candidateId! }, orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <AppShell width="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">AI interviews</h1>
      <p className="mb-6 text-sm text-ink/70">Voice interviews assigned to you by Engrity.</p>
      <div className="space-y-4 stagger">
        {items.map((i) => {
          const overdue = i.dueAt && i.dueAt < now && i.status === "PENDING";
          return (
            <div key={i.id} className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-extrabold">{i.title}</p>
                <p className="text-xs text-ink/60">{i.maxQuestions} questions · ~15–20 min{i.dueAt ? ` · due ${i.dueAt.toLocaleDateString()}` : ""}</p>
              </div>
              {i.status === "COMPLETED" ? <span className="badge badge-green">Completed</span>
                : i.status === "ABANDONED" ? <span className="badge badge-red">Closed</span>
                : overdue ? <span className="badge badge-red">Overdue</span>
                : <Link href={`/interview/${i.id}`} className="btn btn-primary">{i.status === "IN_PROGRESS" ? "Resume" : "Start interview"}</Link>}
            </div>
          );
        })}
        {items.length === 0 && <p className="card p-10 text-center text-ink/50">No interviews assigned yet.</p>}
      </div>
    </AppShell>
  );
}
