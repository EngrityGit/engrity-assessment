import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { RECOMMENDATION_LABELS, type InterviewEvaluation, type Recommendation, type TranscriptEntry } from "@/lib/interview";
import { resetInterview, reevaluateInterview, deleteInterview } from "@/app/actions/interview";
import { INTEGRITY_LABELS } from "@/lib/report-data";
import { JOB_ROLE_LABELS } from "@/lib/quiz";

export default async function AdminInterviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ reset?: string; evaluated?: string; evalfailed?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const sp = await searchParams;
  const iv = await prisma.interview.findUnique({ where: { id }, include: { candidate: true } });
  if (!iv) notFound();

  const scores = (iv.scores as unknown as InterviewEvaluation["scores"] | null) ?? [];
  const summary = iv.summary as unknown as InterviewEvaluation["summary"] | null;
  const transcript = (iv.transcript as unknown as TranscriptEntry[]) ?? [];
  const integrity = (iv.integrity as unknown as { type: string; at: string; counted: boolean }[] | null) ?? [];
  const rec = iv.recommendation as Recommendation | null;
  const recTone = rec === "STRONG_YES" || rec === "YES" ? "badge-green" : rec === "MAYBE" ? "badge-amber" : "badge-red";
  const counts: Record<string, number> = {};
  for (const e of integrity) counts[e.type] = (counts[e.type] ?? 0) + 1;

  return (
    <AppShell width="max-w-4xl">
      <Link href="/admin/interviews" className="text-sm font-semibold text-brand hover:underline">← All interviews</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{iv.candidate.fullName}</h1>
          <p className="text-sm text-ink/70">{iv.title}{iv.targetRole && <> · <span className="badge badge-blue">{JOB_ROLE_LABELS[iv.targetRole]}</span></>}</p>
          <p className="text-xs text-ink/50">{iv.completedAt ? `Completed ${iv.completedAt.toLocaleString()}` : iv.startedAt ? `Started ${iv.startedAt.toLocaleString()}` : "Not started"}{iv.providers && ` · scored by ${iv.providers.replace("+", " + ")}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={reevaluateInterview}><input type="hidden" name="id" value={iv.id} /><button className="btn btn-soft btn-sm" disabled={transcript.length < 2}>Re-run AI scoring</button></form>
          <form action={resetInterview}><input type="hidden" name="id" value={iv.id} /><button className="btn btn-ghost btn-sm">Reset (allow retake)</button></form>
          <form action={deleteInterview}><input type="hidden" name="id" value={iv.id} /><button className="btn btn-ghost btn-sm !text-red-600">Delete</button></form>
        </div>
      </div>

      <div className="space-y-6 stagger">
        {sp.reset && <div className="alert alert-ok">Interview reset — the candidate can take it again.</div>}
        {sp.evaluated && <div className="alert alert-ok">AI scoring updated.</div>}
        {sp.evalfailed && <div className="alert alert-error">AI scoring failed — check the provider keys.</div>}
        {iv.status === "ABANDONED" && <div className="alert alert-error">Closed automatically after repeated integrity violations.</div>}

        {!summary && iv.status !== "COMPLETED" && <p className="card p-8 text-center text-ink/50">Scores will appear once the candidate completes the interview.</p>}

        {summary && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="card-accent p-5"><p className="text-xs font-bold text-brand-dark">AI overall</p><p className="text-4xl font-extrabold text-brand">{iv.overallScore?.toFixed(1)}<span className="text-base text-ink/50"> / 10</span></p></div>
              <div className="card p-5"><p className="text-xs font-bold text-ink/60">Recommendation (advisory)</p><span className={`badge mt-2 ${recTone}`}>{rec ? RECOMMENDATION_LABELS[rec] : "—"}</span></div>
              <div className="card p-5"><p className="text-xs font-bold text-ink/60">Candidate&rsquo;s self-rating</p><p className="text-4xl font-extrabold">{summary.selfRating ?? "—"}<span className="text-base text-ink/50"> / 10</span></p></div>
            </section>

            <section className="card p-6">
              <p className="mb-4 font-bold">{summary.headline}</p>
              {scores.map((s) => (
                <div key={s.key} className="mb-4">
                  <div className="mb-1 flex justify-between text-xs font-bold"><span>{s.label}</span><span>{s.score.toFixed(1)} / 10</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface"><div className="anim-bar h-full rounded-full bg-brand" style={{ width: `${s.score * 10}%` }} /></div>
                  <p className="mt-1 text-xs text-ink/70">{s.evidence}</p>
                </div>
              ))}
              <p className="card-soft mt-2 p-3 text-sm"><strong>Self-rating vs demonstrated:</strong> {summary.selfRatingCheck}</p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="card p-6"><h2 className="mb-2 font-extrabold text-green-700">Strengths</h2><ul className="list-disc space-y-1 pl-5 text-sm">{summary.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
              <div className="card p-6"><h2 className="mb-2 font-extrabold text-amber-700">Concerns</h2><ul className="list-disc space-y-1 pl-5 text-sm">{summary.concerns.length ? summary.concerns.map((s) => <li key={s}>{s}</li>) : <li>None noted.</li>}</ul></div>
            </section>

            <section className="card p-6">
              <h2 className="mb-3 text-lg font-extrabold">Expectations captured</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {([["Pay / rate", summary.expectations.compensation], ["Availability", summary.expectations.availability], ["Travel / rotation", summary.expectations.travel], ["Certifications & tickets", summary.expectations.certifications]] as const).map(([k, v]) => (
                  <div key={k} className="card-soft p-3"><dt className="text-xs font-bold text-ink/60">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
              <h3 className="mb-1 mt-5 text-sm font-extrabold">Suggested follow-up questions for a human interviewer</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">{summary.followUps.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>

            <section className="card p-6">
              <h2 className="mb-2 text-lg font-extrabold">Authenticity &amp; integrity</h2>
              <p className="text-sm">AI-assistance suspicion: <span className={`badge ${summary.authenticity.suspicion >= 60 ? "badge-red" : summary.authenticity.suspicion >= 30 ? "badge-amber" : "badge-green"}`}>{summary.authenticity.suspicion}%</span>{summary.authenticity.signals.map((s) => <span key={s} className="ml-2 text-xs text-ink/60">· {s}</span>)}</p>
              <p className="mt-2 text-sm">Warnings issued: {iv.violationCount}</p>
              {Object.keys(counts).length > 0 && <div className="mt-2 flex flex-wrap gap-2">{Object.entries(counts).map(([t, n]) => <span key={t} className="badge badge-amber">{INTEGRITY_LABELS[t] ?? t}: {n}</span>)}</div>}
              <p className="hint mt-3">These are indicators for human review, not proof of misconduct.</p>
            </section>
          </>
        )}

        {transcript.length > 0 && (
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-extrabold">Transcript</h2>
            <div className="space-y-3">
              {transcript.map((t, i) => (
                <div key={i} className={`flex ${t.role === "candidate" ? "justify-end" : ""}`}>
                  <div className={`max-w-[85%] rounded-[15px] px-4 py-2.5 text-sm ${t.role === "ai" ? "bg-accent" : "bg-surface"}`}>
                    <p className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink/50">{t.role === "ai" ? "Aura (AI)" : "Candidate"}{t.mode && ` · ${t.mode}`}{t.delayMs !== undefined && ` · started after ${(t.delayMs / 1000).toFixed(1)}s`}{t.durationMs && t.words ? ` · ${Math.round((t.words / t.durationMs) * 60000)} wpm` : ""}</p>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
