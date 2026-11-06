"use client";

import { useEffect, useMemo, useState } from "react";
import { PID_SYMBOLS, PidSymbolSvg } from "./PidSymbols";
import { GameResult, useGameSave } from "./GameShell";

type CardT = { key: string; pair: string; kind: "sym" | "name" };

function deal(): CardT[] {
  const pick = [...PID_SYMBOLS].sort(() => Math.random() - 0.5).slice(0, 6);
  const cards: CardT[] = pick.flatMap((s) => [
    { key: `${s.id}-s`, pair: s.id, kind: "sym" as const },
    { key: `${s.id}-n`, pair: s.id, kind: "name" as const },
  ]);
  return cards.sort(() => Math.random() - 0.5);
}

export default function SymbolMatchGame() {
  const [cards, setCards] = useState<CardT[]>(deal);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const { saved, save, reset } = useGameSave("SYMBOL_MATCH");

  useEffect(() => {
    if (!startedAt || score !== null) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(t);
  }, [startedAt, score]);

  const byKey = useMemo(() => new Map(cards.map((c) => [c.key, c])), [cards]);

  function flip(key: string) {
    if (open.length === 2 || open.includes(key) || matched.has(byKey.get(key)!.pair)) return;
    if (!startedAt) setStartedAt(Date.now());
    const next = [...open, key];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => byKey.get(k)!);
      if (a.pair === b.pair && a.kind !== b.kind) {
        const m = new Set(matched).add(a.pair);
        setTimeout(() => {
          setMatched(m);
          setOpen([]);
          if (m.size === 6) {
            const secs = Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000);
            const finalMoves = moves + 1;
            const s = Math.max(100, 1000 - (finalMoves - 6) * 25 - secs * 4);
            setScore(s);
            save(s, 1000, secs * 1000);
          }
        }, 450);
      } else {
        setTimeout(() => setOpen([]), 800);
      }
    }
  }

  function again() {
    setCards(deal());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setStartedAt(null);
    setElapsed(0);
    setScore(null);
    reset();
  }

  if (score !== null) return <GameResult score={score} max={1000} saved={saved} onAgain={again} extra={`${moves} moves · ${elapsed}s`} />;

  return (
    <div>
      <div className="mb-4 flex justify-between text-sm font-bold">
        <span>Moves: {moves}</span>
        <span>Matched: {matched.size}/6</span>
        <span>{elapsed}s</span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const isOpen = open.includes(c.key) || matched.has(c.pair);
          const sym = PID_SYMBOLS.find((s) => s.id === c.pair)!;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(c.key)}
              className={`flex aspect-[4/3] items-center justify-center rounded-[15px] border-2 p-2 text-center text-xs font-extrabold transition duration-300 ${
                matched.has(c.pair) ? "border-green-500 bg-green-50" : isOpen ? "border-brand bg-white" : "border-transparent bg-brand text-white hover:scale-[1.03]"
              }`}
            >
              {isOpen ? (c.kind === "sym" ? <PidSymbolSvg id={c.pair} size={92} /> : sym.name) : "?"}
            </button>
          );
        })}
      </div>
      <p className="hint mt-4">Match each P&amp;ID symbol with its name. Fewer moves and less time = higher score.</p>
    </div>
  );
}
