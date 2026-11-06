"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { submitMemoryRound } from "@/app/actions/attempt";
import ShapeIcon from "@/components/ShapeIcon";
import { useIntegrityMonitor } from "@/lib/useIntegrityMonitor";
import {
  stimulusSpec,
  TRIAL_DURATION_MS,
  type MemoryTrial,
} from "@/lib/memory";

type ClientTrialResult = { index: number; respondedSeen: boolean; reactionMs: number | null };

export default function MemoryRunner({
  attemptId,
  candidateName,
  trials,
}: {
  attemptId: string;
  candidateName: string;
  trials: Pick<MemoryTrial, "index" | "stimulus">[];
}) {
  const [phase, setPhase] = useState<"intro" | "running" | "submitting">("intro");
  const [trialIndex, setTrialIndex] = useState(0);
  const [feedback, setFeedback] = useState<"seen" | null>(null);
  const [isPending, startTransition] = useTransition();

  useIntegrityMonitor(attemptId, phase !== "intro");

  const resultsRef = useRef<ClientTrialResult[]>([]);
  const trialStartRef = useRef<number>(0);
  const respondedRef = useRef(false);
  const submittedRef = useRef(false);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setPhase("submitting");
    startTransition(async () => {
      await submitMemoryRound(attemptId, { results: resultsRef.current });
    });
  }, [attemptId]);

  const advance = useCallback(() => {
    setTrialIndex((i) => {
      const next = i + 1;
      if (next >= trials.length) {
        finish();
        return i;
      }
      return next;
    });
    setFeedback(null);
  }, [trials.length, finish]);

  useEffect(() => {
    if (phase !== "running") return;
    respondedRef.current = false;
    trialStartRef.current = Date.now();

    const timer = setTimeout(() => {
      if (!respondedRef.current) {
        const trial = trials[trialIndex];
        resultsRef.current.push({
          index: trial.index,
          respondedSeen: false,
          reactionMs: null,
        });
        advance();
      }
    }, TRIAL_DURATION_MS);

    return () => clearTimeout(timer);
  }, [phase, trialIndex, trials, advance]);

  function handleSeenClick() {
    if (respondedRef.current || phase !== "running") return;
    respondedRef.current = true;
    const trial = trials[trialIndex];
    const reactionMs = Date.now() - trialStartRef.current;
    resultsRef.current.push({
      index: trial.index,
      respondedSeen: true,
      reactionMs,
    });
    setFeedback("seen");
    setTimeout(() => advance(), 250);
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg card p-8">
          <p className="text-sm text-ink/60 mb-1">Candidate</p>
          <p className="mb-4 font-semibold text-ink">{candidateName}</p>
          <h1 className="text-xl font-bold text-ink mb-3">Memory Test</h1>
          <p className="mb-3 text-sm text-ink/70">
            You&apos;ll see a series of shapes, one at a time. Most are new —
            but some repeat a shape you saw earlier in the sequence.
          </p>
          <p className="mb-6 text-sm text-ink/70">
            Click <strong>&quot;Seen it!&quot;</strong> the moment you
            recognize a repeat. If a shape is new, just wait — it will move
            on by itself.
          </p>
          <button
            type="button"
            onClick={() => setPhase("running")}
            className="btn btn-primary w-full"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-ink/70">{isPending ? "Submitting…" : "Loading…"}</p>
      </div>
    );
  }

  const trial = trials[trialIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-accent">
        <div
          className="h-full rounded-full bg-[#0071FE] transition-all duration-500"
          style={{ width: `${((trialIndex + 1) / trials.length) * 100}%` }}
        />
      </div>

      <div className="flex h-56 w-56 items-center justify-center card">
        <ShapeIcon spec={stimulusSpec(trial.stimulus, 1.4)} size={140} />
      </div>

      <button
        type="button"
        onClick={handleSeenClick}
        disabled={feedback === "seen"}
        className={`mt-8 rounded-[15px] px-8 py-3 text-lg font-semibold text-white transition ${
          feedback === "seen"
            ? "bg-green-600"
            : "bg-[#0071FE] hover:bg-brand-dark"
        }`}
      >
        {feedback === "seen" ? "Recorded" : "Seen it!"}
      </button>

      <p className="mt-4 text-xs text-ink/50">
        Shape {trialIndex + 1} of {trials.length}
      </p>
    </div>
  );
}
