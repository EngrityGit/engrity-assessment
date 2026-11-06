import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import { getAttemptReportData, INTEGRITY_LABELS, CT_DIMENSION_LABELS } from "@/lib/report-data";
import { ROUND_LABELS, TRAIT_LABELS, JOB_ROLE_LABELS } from "@/lib/quiz";
import { promptLabel, isCellSpec } from "@/lib/matrix";
import { isShapeSpec } from "@/components/ShapeIcon";

function Bar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span>{value.toFixed(1)} / {max}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface">
        <div className="anim-bar h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function AuthBadge({ a }: { a: { aiLikelihood: number; signals: string[] } | null }) {
  if (!a) return null;
  const tone = a.aiLikelihood >= 70 ? "badge-red" : a.aiLikelihood >= 40 ? "badge-amber" : "badge-green";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      <span className={`badge ${tone}`}>AI-written likelihood {a.aiLikelihood}%</span>
      {a.signals.map((s) => <span key={s} className="text-ink/60">· {s}</span>)}
    </div>
  );
}

export default async function AttemptReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const d = await getAttemptReportData(id);
  if (!d) notFound();
  const { attempt } = d;
  const riskTone = d.integrityRisk.level === "High" ? "badge-red" : d.integrityRisk.level === "Medium" ? "badge-amber" : "badge-green";

  return (
    <AppShell width="max-w-4xl">
      <Link href="/admin" className="text-sm font-semibold text-brand hover:underline">← Back to admin</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{attempt.candidate.fullName}</h1>
          <p className="text-sm text-ink/70">
            {attempt.candidate.email}
            {attempt.candidate.targetRole && <> · <span className="badge badge-blue">{JOB_ROLE_LABELS[attempt.candidate.targetRole]}</span></>}
          </p>
          <p className="text-xs text-ink/50">
            Started {attempt.startedAt.toLocaleString()} · {attempt.status === "SUBMITTED" ? `Submitted ${attempt.submittedAt?.toLocaleString()}` : attempt.status === "DISQUALIFIED" ? "Terminated for rule violations" : `In progress (${ROUND_LABELS[attempt.currentRound]})`}
          </p>
        </div>
        <a href={`/api/attempts/${attempt.id}/certificate`} target="_blank" className="btn btn-primary">Download PDF</a>
      </div>

      <div className="space-y-6 stagger">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="card-accent p-5">
            <p className="text-xs font-bold text-brand-dark">Overall</p>
            <p className="text-4xl font-extrabold text-brand">{d.overallScore ? d.overallScore.overall.toFixed(1) : "—"}<span className="text-base text-ink/50"> / 10</span></p>
            {d.fitVerdict && <p className="mt-1 text-sm font-bold">{d.fitVerdict.label}</p>}
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold text-ink/60">Integrity risk</p>
            <p className="text-4xl font-extrabold">{d.integrityRisk.score}<span className="text-base text-ink/50"> / 100</span></p>
            <span className={`badge mt-1 ${riskTone}`}>{d.integrityRisk.level}</span>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold text-ink/60">Technical screening</p>
            <p className="text-4xl font-extrabold">{d.technicalScreeningScore ? `${d.technicalScreeningScore.pct}%` : "—"}</p>
            {d.technicalScreeningScore && <p className="text-xs text-ink/60">{d.technicalScreeningScore.pointsAwarded}/{d.technicalScreeningScore.maxPoints} pts</p>}
          </div>
        </section>

        {d.overallScore && (
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-extrabold">Score breakdown</h2>
            <Bar label="Cognitive ability (Math + IQ)" value={d.overallScore.cognitiveAbility} />
            <Bar label="Memory" value={d.overallScore.memory} />
            <Bar label="Personality fit" value={d.overallScore.personalityFit} />
            <Bar label="Critical thinking" value={d.overallScore.criticalThinking} />
            {d.iqIndex && <p className="mt-2 text-sm text-ink/70">IQ-style index {d.iqIndex.index} ({d.iqIndex.label}) — presentation scale, not a clinical IQ.</p>}
          </section>
        )}

        <section className="card p-6">
          <h2 className="mb-1 text-lg font-extrabold">Integrity log</h2>
          <p className="mb-4 text-sm text-ink/70">Warnings issued: {attempt.violationCount} · Written answers flagged as likely AI: {d.integrityRisk.likelyAi} · Answers with few keystrokes for their length: {d.integrityRisk.lowKeystrokes}</p>
          {Object.keys(d.integrityCounts).length === 0 ? (
            <p className="alert alert-ok">No integrity events recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(d.integrityCounts).map(([t, n]) => <span key={t} className="badge badge-amber">{INTEGRITY_LABELS[t] ?? t}: {n}</span>)}
            </div>
          )}
          <p className="hint mt-3">Browser monitoring can&rsquo;t see other devices or apps. Treat this as evidence to review, not proof.</p>
        </section>

        {Object.keys(d.traitScores).length > 0 && (
          <section className="card p-6">
            <h2 className="mb-1 text-lg font-extrabold">Personality</h2>
            {d.personalityArchetype && <p className="mb-4 text-sm"><strong>{d.personalityArchetype.name}</strong> — <em>{d.personalityArchetype.tagline}</em></p>}
            {Object.entries(d.traitScores).map(([t, v]) => <Bar key={t} label={TRAIT_LABELS[t] ?? t} value={v} />)}
            {d.personalitySummary && (
              <div className="card-soft mt-4 space-y-2 p-4 text-sm">
                <p>{d.personalitySummary.generalCharacteristics}</p>
                <p><strong>Strengths:</strong> {d.personalitySummary.strengths.join("; ")}</p>
                <p><strong>Development areas:</strong> {d.personalitySummary.weaknesses.join("; ")}</p>
              </div>
            )}
          </section>
        )}

        <section className="card p-6">
          <h2 className="mb-1 text-lg font-extrabold">Memory</h2>
          <p className="text-sm text-ink/80">
            Accuracy {attempt.memoryAccuracyPct ?? "—"}% · average reaction {attempt.memoryAvgReactionMs ?? "—"} ms · hits {d.memoryStats.hits}, misses {d.memoryStats.misses}, false alarms {d.memoryStats.falseAlarms}
          </p>
        </section>

        {[{ title: "Math", answers: d.mathAnswers, score: attempt.mathScore, max: attempt.mathMax }, { title: "IQ", answers: d.iqAnswers, score: attempt.iqScore, max: attempt.iqMax }].map((r) => (
          <section key={r.title} className="card p-6">
            <h2 className="mb-3 text-lg font-extrabold">{r.title} <span className="text-ink/50">· {r.score ?? "—"}{r.max ? ` / ${r.max}` : ""}</span></h2>
            <div className="space-y-2">
              {[...r.answers].sort((a, b) => a.question.order - b.question.order).map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <span className={`badge mt-0.5 ${a.isCorrect ? "badge-green" : "badge-red"}`}>{a.isCorrect ? "✓" : "✗"}</span>
                  <span className="flex-1">
                    {promptLabel(a.question.prompt)}
                    {!a.isCorrect && a.selectedIndex !== null && (
                      <span className="block text-xs text-ink/60">
                        Chose: {isShapeSpec(a.question.options[a.selectedIndex]) || isCellSpec(a.question.options[a.selectedIndex]) ? `option ${a.selectedIndex + 1}` : a.question.options[a.selectedIndex]}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              {r.answers.length === 0 && <p className="text-sm text-ink/50">Not reached yet.</p>}
            </div>
          </section>
        ))}

        <section className="card p-6">
          <h2 className="mb-3 text-lg font-extrabold">Critical thinking</h2>
          {d.interviewQuestions.length === 0 && <p className="text-sm text-ink/50">Not reached yet.</p>}
          <div className="space-y-4">
            {d.interviewQuestions.map((q, i) => (
              <div key={q.scenarioId} className="card-soft p-4">
                <p className="text-xs font-bold text-brand">Question {i + 1}</p>
                <p className="mb-2 whitespace-pre-wrap text-sm font-semibold">{q.prompt}</p>
                <p className="whitespace-pre-wrap rounded-[12px] bg-white p-3 text-sm">{q.response ?? <em className="text-ink/50">No response</em>}</p>
                <AuthBadge a={q.authenticity} />
                {q.typing && <p className="hint mt-1">{q.typing.keystrokes} keystrokes · {q.typing.chars} characters · {q.typing.pasteBlocked} blocked pastes · {Math.round(q.typing.activeMs / 1000)}s active</p>}
                {q.scores && (
                  <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
                    {Object.entries(q.scores).map(([k, v]) => <Bar key={k} label={CT_DIMENSION_LABELS[k] ?? k} value={v} />)}
                  </div>
                )}
                {q.summary && <p className="text-sm text-ink/80">{q.summary}</p>}
              </div>
            ))}
          </div>
        </section>

        {d.technicalScreeningQuestions.length > 0 && (
          <section className="card p-6">
            <h2 className="mb-3 text-lg font-extrabold">Technical screening</h2>
            <div className="space-y-3">
              {d.technicalScreeningQuestions.map((q) => (
                <div key={q.questionId} className="card-soft p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p><span className="badge badge-blue mr-2">{q.topic}</span><strong>{q.prompt}</strong></p>
                    <span className="badge badge-gray shrink-0">{q.pointsAwarded ?? "—"}/{q.maxPoints}</span>
                  </div>
                  <p className="mt-2 rounded-[12px] bg-white p-3">
                    {q.options.length > 0 ? (q.selectedIndex !== null ? q.options[q.selectedIndex] : <em className="text-ink/50">No answer</em>) : (q.response ?? <em className="text-ink/50">No answer</em>)}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">Reference: {q.referenceAnswer}</p>
                  {q.feedback && <p className="mt-1 text-xs"><strong>AI feedback:</strong> {q.feedback}</p>}
                  <AuthBadge a={q.authenticity} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
