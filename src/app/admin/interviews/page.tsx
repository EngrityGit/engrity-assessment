import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { createInterviews } from "@/app/actions/interview";
import { DEFAULT_CRITERIA, DEFAULT_MAX_QUESTIONS, RECOMMENDATION_LABELS, type Recommendation } from "@/lib/interview";
import { JOB_ROLE_LABELS } from "@/lib/quiz";
import { configuredProviders } from "@/lib/llm";

export const metadata = { title: "Interviews" };

const STATUS: Record<string, [string, string]> = {
  PENDING: ["badge-gray", "Not started"],
  IN_PROGRESS: ["badge-amber", "In progress"],
  COMPLETED: ["badge-green", "Completed"],
  ABANDONED: ["badge-red", "Closed (violations)"],
};

export default async function AdminInterviewsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string; deleted?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { created, error, deleted } = await searchParams;
  const [interviews, candidates] = await Promise.all([
    prisma.interview.findMany({ include: { candidate: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.candidate.findMany({ orderBy: { fullName: "asc" } }),
  ]);
  const providers = configuredProviders();

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">AI voice interviews</h1>
      <p className="mb-6 text-sm text-ink/70">Assign a spoken technical screening. The AI asks, listens, and rates candidates against your criteria.</p>
      {providers.length === 0 && <div className="alert alert-error mb-4">No AI provider key is configured (ANTHROPIC_API_KEY / OPENAI_API_KEY). Interviews will use fixed fallback questions and won&rsquo;t be scored.</div>}
      {created && <div className="alert alert-ok mb-4">{created} interview{created === "1" ? "" : "s"} assigned and emailed.</div>}
      {deleted && <div className="alert alert-ok mb-4">Interview deleted.</div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}

      <details className="card mb-8 p-6" open={interviews.length === 0}>
        <summary className="cursor-pointer text-lg font-extrabold">Assign a new interview</summary>
        <form action={createInterviews} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Title</label>
              <input name="title" defaultValue="Technical screening interview" className="input" />
            </div>
            <div>
              <label className="label">Role being interviewed for</label>
              <select name="targetRole" className="input" defaultValue="">
                <option value="">Use each candidate&rsquo;s target role</option>
                {Object.entries(JOB_ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Number of questions (8–20)</label>
              <input name="maxQuestions" type="number" min={8} max={20} defaultValue={DEFAULT_MAX_QUESTIONS} className="input" />
            </div>
            <div>
              <label className="label">Due date (optional)</label>
              <input name="dueAt" type="date" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Rating criteria &amp; weights (0 removes a criterion)</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEFAULT_CRITERIA.map((c) => (
                <div key={c.key} className="card-soft flex items-center justify-between gap-3 p-3">
                  <span className="text-sm font-semibold">{c.label}</span>
                  <input name={`w_${c.key}`} type="number" min={0} max={100} defaultValue={c.weight} className="input !w-20 !py-1.5 text-center" />
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <input name="customLabel" placeholder="Custom criterion (optional)" className="input" />
              <input name="customDescription" placeholder="What good looks like" className="input sm:col-span-1" />
              <input name="customWeight" type="number" min={1} max={100} defaultValue={15} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Guidance for the AI interviewer (never shown to candidates)</label>
            <textarea name="focusNotes" rows={3} maxLength={1000} className="input" placeholder="e.g. Probe UT weld inspection experience, ask about CWB Level 2 and work in sour gas environments." />
          </div>

          <div>
            <label className="label">Candidates</label>
            <div className="grid max-h-56 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {candidates.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-[12px] bg-surface px-3 py-2 text-sm">
                  <input type="checkbox" name="candidateId" value={c.id} className="h-4 w-4 accent-[#0071fe]" />
                  <span><span className="font-semibold">{c.fullName}</span>{c.targetRole && <span className="ml-1 text-xs text-ink/50">· {JOB_ROLE_LABELS[c.targetRole]}</span>}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Assign &amp; email candidates</button>
        </form>
      </details>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink/60"><tr><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Interview</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">AI score</th><th className="px-4 py-3">Recommendation</th><th /></tr></thead>
          <tbody>
            {interviews.map((i) => {
              const [tone, label] = STATUS[i.status];
              const rec = i.recommendation as Recommendation | null;
              return (
                <tr key={i.id} className="border-t border-surface">
                  <td className="px-4 py-3"><p className="font-bold">{i.candidate.fullName}</p><p className="text-xs text-ink/50">{i.candidate.email}</p></td>
                  <td className="px-4 py-3">{i.title}{i.targetRole && <p className="text-xs text-ink/50">{JOB_ROLE_LABELS[i.targetRole]}</p>}</td>
                  <td className="px-4 py-3"><span className={`badge ${tone}`}>{label}</span>{i.violationCount > 0 && <span className="badge badge-red ml-1">{i.violationCount} ⚠</span>}</td>
                  <td className="px-4 py-3 font-bold">{i.overallScore !== null ? `${i.overallScore.toFixed(1)}/10` : "—"}</td>
                  <td className="px-4 py-3 text-xs">{rec ? RECOMMENDATION_LABELS[rec] : "—"}</td>
                  <td className="px-4 py-3"><Link href={`/admin/interviews/${i.id}`} className="font-bold text-brand hover:underline">Open</Link></td>
                </tr>
              );
            })}
            {interviews.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/50">No interviews yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
