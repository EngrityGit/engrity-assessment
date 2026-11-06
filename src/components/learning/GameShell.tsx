"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveGameScore } from "@/app/actions/learning";
import type { GameKind } from "@/generated/prisma/client";

export function useGameSave(game: GameKind) {
  const [saved, setSaved] = useState(false);
  const saving = useRef(false);
  return {
    saved,
    save(score: number, max: number, durationMs: number) {
      if (saving.current) return;
      saving.current = true;
      saveGameScore(game, score, max, durationMs).then(() => setSaved(true)).catch(() => {});
    },
    reset() {
      saving.current = false;
      setSaved(false);
    },
  };
}

export function GameResult({ score, max, saved, onAgain, extra }: { score: number; max: number; saved: boolean; onAgain: () => void; extra?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setShown(Math.round(score * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);
  return (
    <div className="card-accent p-8 text-center anim-pop">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-dark">Final score</p>
      <p className="text-6xl font-extrabold text-brand">{shown}</p>
      <p className="text-sm text-ink/60">out of {max}</p>
      {extra && <p className="mt-2 text-sm font-semibold">{extra}</p>}
      <p className="mt-2 text-xs text-ink/60">{saved ? "Score saved ✓" : "Saving score…"}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button className="btn btn-primary" onClick={onAgain}>Play again</button>
        <Link href="/learn/games" className="btn btn-ghost">All games</Link>
      </div>
    </div>
  );
}
