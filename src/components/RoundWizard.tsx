"use client";

import { useState, useTransition } from "react";
import { ROUND_GUIDES, RULES } from "@/lib/round-guides";
import type { RoundName } from "@/lib/quiz";
import { beginRound } from "@/app/actions/attempt";

const STEPS = ["Overview", "How it works", "Try it", "Tips", "Rules & start"];

export default function RoundWizard({
  attemptId,
  round,
  roundLabel,
  roundNumber,
  roundTotal,
  minutes,
  questionCount,
}: {
  attemptId: string;
  round: RoundName;
  roundLabel: string;
  roundNumber: number;
  roundTotal: number;
  minutes: number;
  questionCount?: number;
}) {
  const guide = ROUND_GUIDES[round];
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checks, setChecks] = useState<boolean[]>(RULES.map(() => false));
  const [pending, start] = useTransition();

  const allChecked = checks.every(Boolean);

  function begin() {
    // Must be called from the click itself to satisfy the browser's user-gesture rule.
    document.documentElement.requestFullscreen?.().catch(() => {});
    start(async () => {
      await beginRound(attemptId);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-2xl overflow-hidden anim-fade-up">
        <div className="bg-brand px-8 pb-6 pt-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">
            Round {roundNumber} of {roundTotal}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{roundLabel}</h1>
          <p className="mt-1 text-sm opacity-90">{guide.headline}</p>
          <div className="mt-5 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                <div className={`h-full bg-white transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold opacity-90">
            Step {step + 1}: {STEPS[step]}
          </p>
        </div>

        <div className="min-h-[19rem] p-8">
          {step === 0 && (
            <div className="anim-fade-up space-y-5">
              <p className="text-ink/80">{guide.measures}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="card-soft p-4">
                  <p className="text-xs font-bold text-ink/60">Time limit</p>
                  <p className="text-2xl font-extrabold text-brand">{minutes} min</p>
                </div>
                <div className="card-soft p-4">
                  <p className="text-xs font-bold text-ink/60">Questions</p>
                  <p className="text-2xl font-extrabold text-brand">{questionCount ?? "Varies"}</p>
                </div>
              </div>
              <p className="rounded-[15px] bg-accent px-4 py-3 text-sm font-semibold text-brand-dark">
                The clock only starts when you press Start on the last step.
              </p>
            </div>
          )}

          {step === 1 && (
            <ul className="stagger space-y-3">
              {guide.howItWorks.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-[15px] bg-surface px-4 py-3 text-sm">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          )}

          {step === 2 && (
            <div className="anim-fade-up">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand">Practice — not scored</p>
              <p className="mb-4 font-bold">{guide.practice.question}</p>
              <div className="space-y-2">
                {guide.practice.options.map((o, i) => {
                  const chosen = picked === i;
                  const done = picked !== null;
                  const right = i === guide.practice.correct;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={done}
                      onClick={() => setPicked(i)}
                      className={`block w-full rounded-[15px] border-2 px-4 py-2.5 text-left text-sm transition ${
                        done && right
                          ? "border-green-500 bg-green-50"
                          : done && chosen
                            ? "border-red-400 bg-red-50 anim-shake"
                            : "border-transparent bg-surface hover:border-brand"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="alert alert-info mt-4 anim-fade-up">
                  <strong>{picked === guide.practice.correct ? "Nice! " : "Not quite. "}</strong>
                  {guide.practice.explain}
                </p>
              )}
              {guide.modelOutline && (
                <div className="card-accent mt-4 p-4">
                  <p className="mb-2 text-sm font-extrabold">{guide.modelOutline.title}</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm">
                    {guide.modelOutline.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <ul className="stagger space-y-3">
              {guide.tips.map((t) => (
                <li key={t} className="flex gap-3 rounded-[15px] bg-accent/60 px-4 py-3 text-sm">
                  <span className="text-brand">💡</span>
                  {t}
                </li>
              ))}
            </ul>
          )}

          {step === 4 && (
            <div className="anim-fade-up space-y-3">
              <p className="text-sm text-ink/70">Please confirm each point to begin:</p>
              {RULES.map((r, i) => (
                <label key={i} className="flex cursor-pointer gap-3 rounded-[15px] bg-surface px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071fe]"
                    checked={checks[i]}
                    onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                  />
                  {r}
                </label>
              ))}
              <p className="hint">The test will switch your browser to full screen. Close other windows and notifications first.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-accent px-8 py-4">
          <button type="button" className="btn btn-ghost" disabled={step === 0 || pending} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn-primary !px-6" disabled={!allChecked || pending} onClick={begin}>
              {pending ? "Starting…" : `Start ${roundLabel}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
