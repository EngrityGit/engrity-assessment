import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import CopyField from "@/components/ui/CopyField";
import { assignCandidate, setCandidateTargetRole, createCandidateAccount, resendSetupLink } from "@/app/actions/admin";
import { ROUND_LABELS, JOB_ROLE_LABELS } from "@/lib/quiz";

export const metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ assigned?: string; created?: string; resent?: string; setupUrl?: string; createdName?: string; createError?: string }>;
}) {
  const { assigned, created, resent, setupUrl, createdName, createError } = await searchParams;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [candidates, attempts, pendingRequests, expiring, interviewsToReview] = await Promise.all([
    prisma.candidate.findMany({
      include: { assignments: { include: { attempts: true }, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attempt.findMany({ include: { candidate: true }, orderBy: { startedAt: "desc" }, take: 100 }),
    prisma.accessRequest.count({ where: { status: "PENDING" } }),
    prisma.credential.count({ where: { expiresAt: { lte: soon } } }),
    prisma.interview.count({ where: { status: "COMPLETED", recommendation: { not: null } } }),
  ]);
  const now = new Date();
  const inProgress = attempts.filter((a) => a.status === "IN_PROGRESS").length;

  const stats = [
    { label: "Candidates", value: candidates.length, href: "#candidates" },
    { label: "Tests in progress", value: inProgress, href: "#attempts" },
    { label: "Access requests", value: pendingRequests, href: "/admin/invitations", hot: pendingRequests > 0 },
    { label: "Credentials expiring ≤30d", value: expiring, href: "/admin/credentials", hot: expiring > 0 },
    { label: "Interviews scored", value: interviewsToReview, href: "/admin/interviews" },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin overview</h1>
        <p className="text-sm text-ink/70">Visible only to Engrity admins — never shown to candidates.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5 stagger">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`card card-hover p-5 ${s.hot ? "!border-brand" : ""}`}>
            <p className="text-xs font-bold text-ink/60">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.hot ? "text-brand" : ""}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-8">
        {assigned && <div className="alert alert-ok">Assessment assigned.</div>}
        {createError && <div className="alert alert-error">{createError}</div>}
        {(created || resent) && setupUrl && (
          <div className="alert alert-ok anim-pop">
            <p className="font-bold">{created ? `Account created for ${createdName ?? "the new employee"}.` : `New setup link for ${createdName ?? "this candidate"}.`}</p>
            <p className="mb-2 mt-1">Send them this one-time link (valid 7 days). It is only shown once — copy it now.</p>
            <CopyField value={setupUrl} />
          </div>
        )}

        <section className="card p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold">Add an employee</h2>
            <Link href="/admin/invitations" className="btn btn-soft btn-sm">Email invites &amp; share links →</Link>
          </div>
          <form action={createCandidateAccount} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label className="label" htmlFor="newFullName">Full name</label>
              <input id="newFullName" name="fullName" required placeholder="e.g. Jane Smith" className="input" />
            </div>
            <div className="min-w-[12rem] flex-1">
              <label className="label" htmlFor="newEmail">Email</label>
              <input id="newEmail" name="email" type="email" required placeholder="jane@example.com" className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Create account</button>
          </form>
        </section>

        <section id="candidates">
          <h2 className="mb-3 text-lg font-extrabold">Candidates</h2>
          <div className="space-y-3 stagger">
            {candidates.map((c) => {
              const pending = c.assignments.find((a) => !a.attempts[0] || a.attempts[0].status !== "SUBMITTED");
              return (
                <div key={c.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{c.fullName}</p>
                      <p className="text-sm text-ink/60">{c.email}</p>
                    </div>
                    <span className="badge badge-gray">{c.assignments.length} assignment{c.assignments.length === 1 ? "" : "s"}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <form action={setCandidateTargetRole} className="flex items-center gap-2">
                      <input type="hidden" name="candidateId" value={c.id} />
                      <label className="text-xs font-semibold text-ink/60" htmlFor={`role-${c.id}`}>Target role</label>
                      <select id={`role-${c.id}`} name="targetRole" defaultValue={c.targetRole ?? ""} className="input !w-auto !py-1.5 text-xs">
                        <option value="">Not set (generic)</option>
                        {Object.entries(JOB_ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button type="submit" className="btn btn-ghost btn-sm">Save</button>
                    </form>
                    <form action={resendSetupLink}>
                      <input type="hidden" name="candidateId" value={c.id} />
                      <button type="submit" className="text-xs font-bold text-brand hover:underline">Generate new setup link</button>
                    </form>
                  </div>

                  {c.assignments.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {c.assignments.map((a) => {
                        const attempt = a.attempts[0];
                        const overdue = a.dueAt && a.dueAt < now && attempt?.status !== "SUBMITTED";
                        const [tone, text] =
                          attempt?.status === "SUBMITTED" ? ["badge-green", "Completed"]
                          : attempt?.status === "DISQUALIFIED" ? ["badge-red", "Terminated"]
                          : overdue ? ["badge-red", "Overdue"]
                          : attempt ? ["badge-amber", `In progress (${ROUND_LABELS[attempt.currentRound]})`]
                          : ["badge-gray", "Not started"];
                        return (
                          <li key={a.id} className="flex flex-wrap items-center gap-2 text-ink/70">
                            <span className={`badge ${tone}`}>{text}</span>
                            {a.technicalOnly && <span className="badge badge-blue">Technical only</span>}
                            {a.dueAt && <span>Due {a.dueAt.toLocaleDateString()}</span>}
                            {attempt && <Link href={`/admin/attempts/${attempt.id}`} className="font-bold text-brand hover:underline">View report</Link>}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {!pending && (
                    <form action={assignCandidate} className="mt-4 flex flex-wrap items-center gap-3 rounded-[15px] bg-surface p-3">
                      <input type="hidden" name="candidateId" value={c.id} />
                      <label className="text-xs font-semibold text-ink/60" htmlFor={`due-${c.id}`}>Due (optional)</label>
                      <input id={`due-${c.id}`} type="date" name="dueAt" className="input !w-auto !py-1.5 text-sm" />
                      <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                        <input type="checkbox" name="technicalOnly" className="h-4 w-4 accent-[#0071fe]" /> Technical screening only
                      </label>
                      <button type="submit" className="btn btn-primary btn-sm">Assign assessment</button>
                    </form>
                  )}
                </div>
              );
            })}
            {candidates.length === 0 && <p className="card p-8 text-center text-ink/50">No candidates yet — invite someone above.</p>}
          </div>
        </section>

        <section id="attempts">
          <h2 className="mb-3 text-lg font-extrabold">Recent attempts</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink/60">
                <tr>
                  <th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Math</th>
                  <th className="px-4 py-3">Memory</th><th className="px-4 py-3">IQ</th><th className="px-4 py-3">Warnings</th>
                  <th className="px-4 py-3">Started</th><th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t border-surface">
                    <td className="px-4 py-3"><p className="font-bold">{a.candidate.fullName}</p><p className="text-xs text-ink/50">{a.candidate.email}</p></td>
                    <td className="px-4 py-3">
                      {a.status === "SUBMITTED" ? <span className="badge badge-green">Submitted</span>
                        : a.status === "DISQUALIFIED" ? <span className="badge badge-red">Terminated</span>
                        : a.status === "EXPIRED" ? <span className="badge badge-gray">Expired</span>
                        : <span className="badge badge-amber">{ROUND_LABELS[a.currentRound]}</span>}
                    </td>
                    <td className="px-4 py-3">{a.mathScore !== null ? `${a.mathScore}/${a.mathMax}` : "—"}</td>
                    <td className="px-4 py-3">{a.memoryAccuracyPct !== null ? `${a.memoryAccuracyPct}%` : "—"}</td>
                    <td className="px-4 py-3">{a.iqScore !== null ? `${a.iqScore}/${a.iqMax}` : "—"}</td>
                    <td className="px-4 py-3">{a.violationCount > 0 ? <span className="badge badge-red">{a.violationCount}</span> : <span className="text-ink/40">0</span>}</td>
                    <td className="px-4 py-3 text-ink/60">{a.startedAt.toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/admin/attempts/${a.id}`} className="font-bold text-brand hover:underline">View</Link>
                      <span className="mx-1.5 text-ink/30">·</span>
                      <a href={`/api/attempts/${a.id}/certificate`} className="font-bold text-brand hover:underline">PDF</a>
                    </td>
                  </tr>
                ))}
                {attempts.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-ink/50">No attempts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
