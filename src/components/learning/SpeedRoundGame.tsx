"use client";

import { useEffect, useRef, useState } from "react";
import { SPEED_BANK, type TrueFalse } from "@/lib/learning/games";
import { GameResult, useGameSave } from "./GameShell";

const COUNT = 20;
const SECONDS = 12;

const pickSet = (): TrueFalse[] => [...SPEED_BANK].sort(() => Math.random() - 0.5).slice(0, COUNT);

export default function SpeedRoundGame() {
  const [set, setSet] = useState<TrueFalse[]>(pickSet);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [fb, setFb] = useState<{ ok: boolean; why: string } | null>(null);
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const { saved, save, reset } = useGameSave("SPEED_ROUND");

  useEffect(() => {
    if (fb || done) return;
    if (left <= 0) {
      answer(null);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, fb, done]);

  function answer(choice: boolean | null) {
    if (fb) return;
    const q = set[i];
    const ok = choice === q.a;
    let total = score;
    if (ok) {
      const bonus = Math.round((left / SECONDS) * 25);
      total = score + 50 + bonus;
      setScore(total);
      setStreak((s) => { const n = s + 1; setBest((b) => Math.max(b, n)); return n; });
    } else {
      setStreak(0);
    }
    setFb({ ok, why: choice === null ? `Time's up. ${q.why}` : q.why });
    setTimeout(() => {
      setFb(null);
      if (i + 1 >= COUNT) {
        setDone(true);
        save(total, 1500, Date.now() - started.current);
      } else {
        setI(i + 1);
        setLeft(SECONDS);
      }
    }, ok ? 900 : 2000);
  }

  function again() {
    setSet(pickSet()); setI(0); setScore(0); setStreak(0); setBest(0); setLeft(SECONDS); setFb(null); setDone(false);
    started.current = Date.now();
    reset();
  }

  if (done) return <GameResult score={score} max={1500} saved={saved} onAgain={again} extra={`Best streak: ${best}`} />;
  const q = set[i];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold">
        <span>Question {i + 1}/{COUNT}</span>
        <span className="text-brand">Score {score}</span>
        <span>🔥 {streak}</span>
      </div>
      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-accent">
        <div className="h-full rounded-full bg-brand transition-all duration-1000 ease-linear" style={{ width: `${(left / SECONDS) * 100}%` }} />
      </div>
      <div key={i} className="card p-8 text-center anim-pop">
        <p className="text-xl font-extrabold">{q.s}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button disabled={!!fb} onClick={() => answer(true)} className="btn btn-primary !py-4 !text-base">True</button>
        <button disabled={!!fb} onClick={() => answer(false)} className="btn btn-soft !py-4 !text-base">False</button>
      </div>
      {fb && <p className={`alert mt-4 anim-fade-up ${fb.ok ? "alert-ok" : "alert-error"}`}><strong>{fb.ok ? "Correct! " : "Not quite. "}</strong>{fb.why}</p>}
    </div>
  );
}
