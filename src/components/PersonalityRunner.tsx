"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { submitPersonalityRound } from "@/app/actions/attempt";
import { useIntegrityMonitor } from "@/lib/useIntegrityMonitor";

type PQuestion = {
  id: string;
  statement: string;
};

const SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export default function PersonalityRunner({
  attemptId,
  candidateName,
  questions,
  deadline,
}: {
  attemptId: string;
  candidateName: string;
  questions: PQuestion[];
  deadline: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  useIntegrityMonitor(attemptId, true);

  const deadlineMs = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const payload = questions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        value: answers[q.id],
      }));
    startTransition(async () => {
      await submitPersonalityRound(attemptId, payload);
    });
  }, [answers, attemptId, questions]);

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
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/60">Personality Test — {candidateName}</p>
          <div
            className={`rounded-[12px] px-3 py-1.5 text-sm font-semibold ${
              timeLow ? "bg-red-100 text-red-700" : "bg-accent text-brand-dark"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
          </div>
        </div>

        <p className="mb-6 text-sm text-ink/70">
          Rate how much you agree with each statement. There are no right or
          wrong answers — answer honestly and go with your first instinct.
        </p>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div
              key={q.id}
              className="card p-5"
            >
              <p className="mb-3 text-sm font-medium text-ink">
                {qi + 1}. {q.statement}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {SCALE.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                    className={`rounded-[15px] border px-2 py-2 text-center text-xs transition ${
                      answers[q.id] === opt.value
                        ? "border-[#0071FE] bg-[#0071FE] text-white"
                        : "border-transparent bg-surface text-ink/80 hover:border-brand"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 mt-6 flex items-center justify-between card p-4">
          <p className="text-sm text-ink/60">
            {totalAnswered} of {questions.length} answered
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={doSubmit}
            className="btn btn-primary"
          >
            {isPending ? "Submitting…" : "Submit & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
