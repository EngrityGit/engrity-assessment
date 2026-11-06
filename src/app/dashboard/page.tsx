import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { startAssignedAttempt } from "@/app/actions/attempt";
import { ROUND_LABELS, ROUND_ORDER, JOB_ROLE_LABELS } from "@/lib/quiz";
import { MODULES } from "@/lib/learning";
import { computeXp } from "@/lib/learning/xp";
import { credentialStatus } from "@/lib/credential-status";

export const metadata = { title: "Home" };

type DashboardStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "TERMINATED";

function deriveStatus(dueAt: Date | null, attempt: { status: string } | undefined, now: Date): DashboardStatus {
  if (attempt?.status === "SUBMITTED") return "COMPLETED";
  if (attempt?.status === "DISQUALIFIED") return "TERMINATED";
  if (attempt?.status === "EXPIRED") return "EXPIRED";
  if (dueAt && dueAt < now) return "EXPIRED";
  if (attempt) return "IN_PROGRESS";
  return "NOT_STARTED";
}

const STATUS: Record<DashboardStatus, [string, string]> = {
  NOT_STARTED: ["badge-gray", "Not started"],
  IN_PROGRESS: ["badge-amber", "In progress"],
  COMPLETED: ["badge-green", "Completed"],
  EXPIRED: ["badge-red", "Expired"],
  TERMINATED: ["badge-red", "Closed — rule violation"],
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) redirect("/login");
  const cid = session.user.candidateId;

  const [candidate, progress, games, credentials, interviews, shared] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id: cid },
      include: { assignments: { include: { attempts: { include: { certificate: true } } }, orderBy: { createdAt: "desc" } } },
    }),
    prisma.lessonProgress.findMany({ where: { candidateId: cid } }),
    prisma.gameScore.groupBy({ by: ["game"], where: { candidateId: cid }, _max: { score: true } }),
    prisma.credential.findMany({ where: { candidateId: cid }, select: { name: true, expiresAt: true } }),
    prisma.interview.findMany({ where: { candidateId: cid, status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    prisma.documentShare.count({ where: { userId: session.user.id } }),
  ]);
  if (!candidate) redirect("/login");

  const now = new Date();
  const completedAttempts = candidate.assignments
    .flatMap((a) => a.attempts)
    .filter((a) => a.status === "SUBMITTED")
    .sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0));

  const xp = computeXp(progress, games.map((g) => g._max.score ?? 0));
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const doneLessons = progress.filter((p) => p.completedAt).length;
  const attention = credentials.filter((c) => {
    const s = credentialStatus(c.expiresAt).status;
    return s === "expired" || s === "expiring";
  });
  const nextLesson = MODULES.flatMap((m) => m.lessons.map((l) => ({ m, l }))).find(({ l }) => !progress.some((p) => p.lessonSlug === l.slug && p.completedAt));

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 anim-fade-up">
        <div>
          <p className="text-sm font-semibold text-brand">Welcome back</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Hi, {candidate.fullName.split(/\s+/)[0]} 👋</h1>
          <p className="text-sm text-ink/60">
            {candidate.email}
            {candidate.targetRole && <> · <span className="badge badge-blue">{JOB_ROLE_LABELS[candidate.targetRole]}</span></>}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Link href="/learn" className="card card-hover p-5">
          <p className="text-xs font-bold text-ink/60">Learning</p>
          <p className="text-3xl font-extrabold text-brand">{doneLessons}<span className="text-base text-ink/40">/{totalLessons}</span></p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent"><div className="anim-bar h-full rounded-full bg-brand" style={{ width: `${(doneLessons / totalLessons) * 100}%` }} /></div>
          <p className="mt-1 text-xs text-ink/60">Level {xp.level} · {xp.xp} XP</p>
        </Link>
        <Link href="/interview" className={`card card-hover p-5 ${interviews.length ? "!border-brand" : ""}`}>
          <p className="text-xs font-bold text-ink/60">AI interviews</p>
          <p className="text-3xl font-extrabold">{interviews.length}</p>
          <p className="text-xs text-ink/60">{interviews.length ? "waiting for you" : "none assigned"}</p>
        </Link>
        <Link href="/credentials" className={`card card-hover p-5 ${attention.length ? "!border-amber-400" : ""}`}>
          <p className="text-xs font-bold text-ink/60">Credentials</p>
          <p className="text-3xl font-extrabold">{credentials.length}</p>
          <p className={`text-xs ${attention.length ? "font-bold text-amber-700" : "text-ink/60"}`}>{attention.length ? `${attention.length} need renewal` : "all up to date"}</p>
        </Link>
        <Link href="/documents" className="card card-hover p-5">
          <p className="text-xs font-bold text-ink/60">Documents</p>
          <p className="text-3xl font-extrabold">{shared}</p>
          <p className="text-xs text-ink/60">shared with you</p>
        </Link>
      </div>

      {interviews.length > 0 && (
        <div className="card-accent mb-8 flex flex-wrap items-center justify-between gap-3 p-5 anim-pop">
          <div><p className="font-extrabold">🎙️ Your AI interview is ready</p><p className="text-sm text-ink/70">{interviews[0].title} — find a quiet place and allow microphone access.</p></div>
          <Link href={`/interview/${interviews[0].id}`} className="btn btn-primary">{interviews[0].status === "IN_PROGRESS" ? "Resume" : "Start"}</Link>
        </div>
      )}

      <h2 className="mb-3 text-lg font-extrabold">My assessments</h2>
      {candidate.assignments.length === 0 ? (
        <p className="card mb-10 p-8 text-center text-ink/50">No assessments assigned yet. Engrity will notify you once one is assigned — meanwhile, keep learning!</p>
      ) : (
        <div className="mb-10 space-y-3 stagger">
          {candidate.assignments.map((assignment) => {
            const attempt = assignment.attempts[0];
            const status = deriveStatus(assignment.dueAt, attempt, now);
            const canStart = status === "NOT_STARTED" || status === "IN_PROGRESS";
            const [tone, label] = STATUS[status];
            return (
              <div key={assignment.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{assignment.technicalOnly ? "Engrity Technical Screening" : "Engrity Candidate Assessment"}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{assignment.technicalOnly ? "Technical questions for your role only" : ROUND_ORDER.map((r) => ROUND_LABELS[r]).join(" · ")}</p>
                    {assignment.dueAt && <p className="mt-1 text-xs text-ink/60">Due {assignment.dueAt.toLocaleDateString()}</p>}
                    {attempt && status === "IN_PROGRESS" && <p className="mt-1 text-xs font-semibold text-amber-700">Currently on: {ROUND_LABELS[attempt.currentRound]}</p>}
                  </div>
                  <span className={`badge ${tone}`}>{label}</span>
                </div>
                {canStart && (
                  <>
                    <div className="alert alert-info mt-4 !text-xs">
                      Every round starts with a short guided walkthrough and practice example — the clock only starts when you press Start. The test runs in full screen. AI tools, other tabs or outside help are not allowed: leaving the tab or full screen, copying or pasting gives a warning, and after 3 warnings your test is closed automatically.
                    </div>
                    <form action={startAssignedAttempt} className="mt-4">
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <button type="submit" className="btn btn-primary">{attempt ? "Resume assessment" : "Start assessment"}</button>
                    </form>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {nextLesson && (
        <>
          <h2 className="mb-3 text-lg font-extrabold">Up next in Learn</h2>
          <Link href={`/learn/${nextLesson.m.slug}/${nextLesson.l.slug}`} className="card card-hover mb-10 flex items-center gap-4 p-5">
            <span className="text-3xl">{nextLesson.m.icon}</span>
            <div className="flex-1"><p className="font-extrabold">{nextLesson.l.title}</p><p className="text-sm text-ink/60">{nextLesson.m.title} · {nextLesson.l.minutes} min</p></div>
            <span className="btn btn-soft btn-sm">Start</span>
          </Link>
        </>
      )}

      <h2 className="mb-3 text-lg font-extrabold">Recent activity</h2>
      {completedAttempts.length === 0 ? (
        <p className="card p-8 text-center text-ink/50">Nothing completed yet.</p>
      ) : (
        <div className="space-y-3 stagger">
          {completedAttempts.map((attempt) => (
            <div key={attempt.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold">Engrity Candidate Assessment</p>
                <p className="text-xs text-ink/60">Completed {attempt.submittedAt?.toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70">
                <span>Math: {attempt.mathScore ?? "—"}/{attempt.mathMax ?? "—"}</span>
                <span>Memory: {attempt.memoryAccuracyPct ?? "—"}%</span>
                <span>IQ: {attempt.iqScore ?? "—"}/{attempt.iqMax ?? "—"}</span>
                {attempt.certificate && <a href={`/certificates/${attempt.certificate.verificationCode}`} target="_blank" rel="noopener noreferrer" className="font-bold text-brand hover:underline">View certificate</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
