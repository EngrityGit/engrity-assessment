"use client";

import { useRef, useState } from "react";
import { ERROR_SCENARIOS } from "@/lib/learning/games";
import { GameResult, useGameSave } from "./GameShell";

export default function ErrorHuntGame() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const { saved, save, reset } = useGameSave("ERROR_HUNT");
  const s = ERROR_SCENARIOS[i];

  function pick(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === s.errorIndex) setScore((x) => x + 100);
  }
  function next() {
    if (i + 1 >= ERROR_SCENARIOS.length) {
      setDone(true);
      save(score, 600, Date.now() - started.current);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }
  function again() {
    setI(0); setPicked(null); setScore(0); setDone(false); started.current = Date.now(); reset();
  }

  if (done) return <GameResult score={score} max={600} saved={saved} onAgain={again} extra={`${score / 100} of ${ERROR_SCENARIOS.length} errors found`} />;

  return (
    <div>
      <div className="mb-3 flex justify-between text-sm font-bold">
        <span>Case {i + 1}/{ERROR_SCENARIOS.length} · {s.title}</span>
        <span className="text-brand">Score {score}</span>
      </div>
      <p className="mb-3 text-sm text-ink/70">One line in this document is wrong. Tap it — like an inspector reviewing paperwork.</p>
      <div key={i} className="card overflow-hidden anim-fade-up">
        <div className="bg-ink px-4 py-2 text-xs font-bold text-white">{s.doc}</div>
        <div className="space-y-1.5 p-3">
          {s.lines.map((l, idx) => (
            <button
              key={idx}
              onClick={() => pick(idx)}
              disabled={picked !== null}
              className={`block w-full rounded-[12px] border-2 px-3 py-2.5 text-left font-mono text-sm transition ${
                picked !== null && idx === s.errorIndex ? "border-green-500 bg-green-50" : picked === idx ? "border-red-400 bg-red-50 anim-shake" : "border-transparent bg-surface hover:border-brand"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {picked !== null && (
        <div className="mt-4 anim-fade-up">
          <p className={`alert ${picked === s.errorIndex ? "alert-ok" : "alert-error"}`}>
            <strong>{picked === s.errorIndex ? "Found it! " : `The error was line ${s.errorIndex + 1}. `}</strong>{s.why}
          </p>
          <button className="btn btn-primary mt-3" onClick={next}>{i + 1 >= ERROR_SCENARIOS.length ? "Finish" : "Next case"}</button>
        </div>
      )}
    </div>
  );
}
