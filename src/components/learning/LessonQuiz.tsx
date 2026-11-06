"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { QuizQ } from "@/lib/learning/types";
import { saveLessonProgress } from "@/app/actions/learning";

export default function LessonQuiz({
  lessonSlug,
  questions,
  next,
}: {
  lessonSlug: string;
  questions: QuizQ[];
  next: { href: string; title: string } | null;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const q = questions[i];

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  }

  function advance() {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    start(async () => {
      await saveLessonProgress(lessonSlug, score, questions.length, true);
    });
  }

  function retry() {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card-accent p-8 text-center anim-pop">
        <p className="text-5xl font-extrabold text-brand">{score}/{questions.length}</p>
        <p className="mt-1 font-bold">{pct === 100 ? "Perfect — lesson complete! 🎉" : pct >= 60 ? "Nice work — lesson complete." : "Lesson complete. Review the tips and try again for a better score."}</p>
        <p className="mt-1 text-sm text-ink/70">{pending ? "Saving progress…" : "Progress saved."}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button className="btn btn-ghost" onClick={retry}>Retry quiz</button>
          {next ? <Link href={next.href} className="btn btn-primary">Next: {next.title}</Link> : <Link href="/learn" className="btn btn-primary">Back to Learn</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink/60">
        <span>Check your understanding</span>
        <span>{i + 1} / {questions.length}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-accent">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${(i / questions.length) * 100}%` }} />
      </div>
      <p key={i} className="mb-4 font-bold anim-fade-up">{q.q}</p>
      <div className="space-y-2">
        {q.options.map((o, idx) => {
          const done = picked !== null;
          const right = idx === q.correct;
          return (
            <button
              key={idx}
              type="button"
              disabled={done}
              onClick={() => choose(idx)}
              className={`block w-full rounded-[15px] border-2 px-4 py-2.5 text-left text-sm transition ${
                done && right ? "border-green-500 bg-green-50" : done && picked === idx ? "border-red-400 bg-red-50 anim-shake" : "border-transparent bg-surface hover:border-brand"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 anim-fade-up">
          <p className="alert alert-info"><strong>{picked === q.correct ? "Correct. " : "Not quite. "}</strong>{q.why}</p>
          <button className="btn btn-primary mt-3" onClick={advance}>{i + 1 < questions.length ? "Next question" : "Finish"}</button>
        </div>
      )}
    </div>
  );
}
