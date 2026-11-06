"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, useRef } from "react";
import ShapeIcon, { isShapeSpec } from "@/components/ShapeIcon";
import PatternCell, { MatrixPuzzle } from "@/components/PatternCell";
import { isCellSpec, isMatrixPrompt } from "@/lib/matrix";
import { useIntegrityMonitor } from "@/lib/useIntegrityMonitor";

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

type Answer = { questionId: string; selectedIndex: number | null };

export default function TestRunner({
  attemptId,
  candidateName,
  questions = [],
  deadline,
  roundLabel,
  submitLabel,
  submitAction,
}: {
  attemptId: string;
  candidateName: string;
  questions: Question[];
  deadline: string;
  roundLabel: string;
  submitLabel: string;
  submitAction: (attemptId: string, answers: Answer[]) => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  useIntegrityMonitor(attemptId, true);

  const deadlineMs = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const payload: Answer[] = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? null,
    }));
    startTransition(async () => {
      await submitAction(attemptId, payload);
    });
  }, [answers, attemptId, questions, submitAction]);

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

  // Guard: If there are no questions returned from the database
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="card max-w-md p-6 text-center">
          <h2 className="text-lg font-semibold text-ink">No Questions Available</h2>
          <p className="mt-2 text-sm text-ink/60">
            There are currently no questions configured for {roundLabel}. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const question = questions[index];

  // Extra guard in case index gets out of bounds
  if (!question) {
    return null;
  }

  const totalAnswered = Object.keys(answers).length;
  const isLast = index === questions.length - 1;
  const options = question.options ?? [];

  const minutes = Math.max(0, Math.floor(remainingMs / 60000));
  const seconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const timeLow = remainingMs < 60 * 1000;

  function selectOption(qId: string, optIndex: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/60">
              {roundLabel} — {candidateName}
            </p>
          </div>
          <div
            className={`rounded-[12px] px-3 py-1.5 text-sm font-semibold ${
              timeLow ? "bg-red-100 text-red-700" : "bg-accent text-brand-dark"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
          </div>
        </div>

        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-[#0071FE] transition-all duration-500"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="card p-6">
          <div className="mb-4 text-xs text-ink/60">
            Question {index + 1} of {questions.length}
          </div>

          {question.prompt && isMatrixPrompt(question.prompt) ? (
            <div className="mb-5">
              <MatrixPuzzle prompt={question.prompt} />
            </div>
          ) : (
            <p className="mb-5 text-lg font-medium text-ink">
              {question.prompt ?? ""}
            </p>
          )}

          <div
            className={
              options.some(isCellSpec)
                ? "grid grid-cols-3 gap-3"
                : options.some(isShapeSpec)
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
                  : "space-y-2"
            }
          >
            {options.map((opt, i) => {
              const selected = answers[question.id] === i;
              if (isCellSpec(opt)) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOption(question.id, i)}
                    aria-label={`Option ${i + 1}`}
                    className={`flex items-center justify-center rounded-[15px] border p-2 transition ${
                      selected
                        ? "border-[#0071FE] bg-accent ring-2 ring-[#0071FE]"
                        : "border-transparent bg-surface hover:border-brand"
                    }`}
                  >
                    <PatternCell spec={opt} size={76} />
                  </button>
                );
              }
              if (isShapeSpec(opt)) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOption(question.id, i)}
                    className={`flex items-center justify-center rounded-[15px] border p-4 transition ${
                      selected
                        ? "border-[#0071FE] bg-[#0071FE]"
                        : "border-transparent bg-surface hover:border-brand"
                    }`}
                  >
                    <ShapeIcon spec={opt} size={56} />
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectOption(question.id, i)}
                  className={`block w-full rounded-[15px] border px-4 py-2.5 text-left text-sm transition ${
                    selected
                      ? "border-[#0071FE] bg-[#0071FE] text-white"
                      : "border-transparent bg-surface text-ink hover:border-brand"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="btn btn-ghost"
            >
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                disabled={isPending}
                onClick={doSubmit}
                className="btn btn-primary"
              >
                {isPending ? "Submitting…" : submitLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink/50">
          {totalAnswered} of {questions.length} answered — you can revisit
          questions before continuing.
        </p>
      </div>
    </div>
  );
}