"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useIntegrityMonitor } from "@/lib/useIntegrityMonitor";
import TrackedTextarea, { type TypingStats } from "@/components/TrackedTextarea";

const MIN_LENGTH = 50;

export interface CriticalThinkingQuestion {
  scenarioId: string;
  prompt: string;
}

export default function CriticalThinkingRunner({
  attemptId,
  candidateName,
  questions,
  deadline,
  submitAction,
}: {
  attemptId: string;
  candidateName: string;
  questions: CriticalThinkingQuestion[];
  deadline: string;
  submitAction: (
    attemptId: string,
    responses: { scenarioId: string; response: string; typing?: TypingStats }[]
  ) => Promise<void>;
}) {
  const [responses, setResponses] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.scenarioId, ""]))
  );
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const statsRef = useRef<Record<string, TypingStats>>({});
  const responsesRef = useRef(responses);
  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  useIntegrityMonitor(attemptId, true);

  const deadlineMs = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      const payload = questions.map((q) => ({
        scenarioId: q.scenarioId,
        response: responsesRef.current[q.scenarioId] ?? "",
        typing: statsRef.current[q.scenarioId],
      }));
      await submitAction(attemptId, payload);
    });
  }, [attemptId, questions, submitAction]);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = deadlineMs - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        doSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs, doSubmit]);

  const minutes = Math.max(0, Math.floor(remainingMs / 60000));
  const seconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const timeLow = remainingMs < 60 * 1000;

  const meetsMinimum = questions.every(
    (q) => (responses[q.scenarioId] ?? "").trim().length >= MIN_LENGTH
  );
  const answeredCount = questions.filter(
    (q) => (responses[q.scenarioId] ?? "").trim().length >= MIN_LENGTH
  ).length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/60">Interview Questions — {candidateName}</p>
          <div
            className={`rounded-[12px] px-3 py-1.5 text-sm font-semibold ${
              timeLow ? "bg-red-100 text-red-700" : "bg-accent text-brand-dark"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
          </div>
        </div>

        <p className="mb-6 text-sm text-ink/70">
          Read each scenario below and write your response in your own words.
          There is no single correct answer — explain your reasoning clearly.
          ({answeredCount}/{questions.length} ready to submit)
        </p>

        <div className="space-y-6">
          {questions.map((q, i) => {
            const response = responses[q.scenarioId] ?? "";
            const wordCount = response.trim().length === 0 ? 0 : response.trim().split(/\s+/).length;
            const meetsThis = response.trim().length >= MIN_LENGTH;
            return (
              <div key={q.scenarioId} className="card p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                  Question {i + 1} of {questions.length}
                  {meetsThis ? " · Ready" : ""}
                </p>
                <p className="mb-5 whitespace-pre-wrap text-base font-medium text-ink">
                  {q.prompt}
                </p>

                <TrackedTextarea
                  value={response}
                  onChange={(v) => setResponses((prev) => ({ ...prev, [q.scenarioId]: v }))}
                  onStats={(st) => { statsRef.current[q.scenarioId] = st; }}
                  rows={8}
                  maxLength={8000}
                  placeholder="Type your response here — in your own words…"
                  className="input"
                />
                <p className="mt-2 text-xs text-ink/50">{wordCount} words</p>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-4 mt-6 flex items-center justify-between card p-4">
          <p className="text-sm text-ink/60">
            {meetsMinimum
              ? "Ready to submit."
              : `Write at least a few sentences for each question before submitting.`}
          </p>
          <button
            type="button"
            disabled={isPending || !meetsMinimum}
            onClick={doSubmit}
            className="btn btn-primary"
          >
            {isPending ? "Submitting…" : "Submit Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
