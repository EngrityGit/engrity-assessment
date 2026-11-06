"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useIntegrityMonitor } from "@/lib/useIntegrityMonitor";
import TrackedTextarea, { type TypingStats } from "@/components/TrackedTextarea";

const MIN_LENGTH = 2;

export interface TechnicalScreeningQuestion {
  questionId: string;
  topic: string;
  prompt: string;
  options: string[];
}

interface AnswerState {
  response: string;
  selectedIndex: number | null;
}

export default function TechnicalScreeningRunner({
  attemptId,
  candidateName,
  questions,
  deadline,
  submitAction,
}: {
  attemptId: string;
  candidateName: string;
  questions: TechnicalScreeningQuestion[];
  deadline: string;
  submitAction: (
    attemptId: string,
    responses: { questionId: string; response: string; selectedIndex: number | null; typing?: TypingStats }[]
  ) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() =>
    Object.fromEntries(questions.map((q) => [q.questionId, { response: "", selectedIndex: null }]))
  );
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const statsRef = useRef<Record<string, TypingStats>>({});
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useIntegrityMonitor(attemptId, true);

  const deadlineMs = useMemo(() => new Date(deadline).getTime(), [deadline]);
  const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      const payload = questions.map((q) => {
        const a = answersRef.current[q.questionId] ?? { response: "", selectedIndex: null };
        return { questionId: q.questionId, response: a.response, selectedIndex: a.selectedIndex, typing: statsRef.current[q.questionId] };
      });
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
  const timeLow = remainingMs < 5 * 60 * 1000;

  function isAnswered(q: TechnicalScreeningQuestion) {
    const a = answers[q.questionId];
    if (!a) return false;
    return q.options.length > 0 ? a.selectedIndex !== null : a.response.trim().length >= MIN_LENGTH;
  }

  const answeredCount = questions.filter(isAnswered).length;
  const meetsMinimum = answeredCount === questions.length;

  const topics: string[] = [];
  for (const q of questions) {
    if (!topics.includes(q.topic)) topics.push(q.topic);
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/60">Technical Screening — {candidateName}</p>
          <div
            className={`rounded-[12px] px-3 py-1.5 text-sm font-semibold ${
              timeLow ? "bg-red-100 text-red-700" : "bg-accent text-brand-dark"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
          </div>
        </div>

        <p className="mb-6 text-sm text-ink/70">
          Answer each question based on your hands-on experience. For written answers, short and
          specific is fine — you don&rsquo;t need full sentences. ({answeredCount}/{questions.length}{" "}
          answered)
        </p>

        {topics.map((topic) => (
          <div key={topic} className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">
              {topic}
            </h2>
            <div className="space-y-4">
              {questions
                .filter((q) => q.topic === topic)
                .map((q) => {
                  const answer = answers[q.questionId] ?? { response: "", selectedIndex: null };
                  const meetsThis = isAnswered(q);
                  return (
                    <div
                      key={q.questionId}
                      className="card p-4"
                    >
                      <p className="mb-2 flex items-start justify-between gap-2 text-sm font-medium text-ink">
                        <span>{q.prompt}</span>
                        {meetsThis && (
                          <span className="shrink-0 text-xs font-semibold text-green-600">
                            Answered
                          </span>
                        )}
                      </p>
                      {q.options.length > 0 ? (
                        <div className="space-y-2">
                          {q.options.map((opt, i) => {
                            const selected = answer.selectedIndex === i;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [q.questionId]: { response: "", selectedIndex: i },
                                  }))
                                }
                                className={`block w-full rounded-[15px] border px-3 py-2 text-left text-sm transition ${
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
                      ) : (
                        <TrackedTextarea
                          value={answer.response}
                          onChange={(v) =>
                            setAnswers((prev) => ({ ...prev, [q.questionId]: { response: v, selectedIndex: null } }))
                          }
                          onStats={(st) => { statsRef.current[q.questionId] = st; }}
                          rows={2}
                          maxLength={2000}
                          placeholder="Type your answer here…"
                          className="input"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="sticky bottom-4 mt-6 flex items-center justify-between card p-4">
          <p className="text-sm text-ink/60">
            {meetsMinimum
              ? "Ready to submit."
              : `Answer all questions before submitting (${answeredCount}/${questions.length} so far).`}
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
