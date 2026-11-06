import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import type { GameKind } from "@/generated/prisma/client";

export const metadata = { title: "Games" };

const GAMES: { slug: string; kind: GameKind; name: string; icon: string; blurb: string }[] = [
  { slug: "symbol-match", kind: "SYMBOL_MATCH", name: "Symbol Match", icon: "🧩", blurb: "Flip cards to pair P&ID symbols with their names." },
  { slug: "speed-round", kind: "SPEED_ROUND", name: "Speed Round", icon: "⚡", blurb: "20 true/false trade facts against the clock. Build a streak." },
  { slug: "error-hunt", kind: "ERROR_HUNT", name: "Error Hunt", icon: "🕵️", blurb: "Spot the wrong line in an MTR, WPS, iso or NDT report." },
];

export default async function GamesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const cid = session.user.candidateId;

  const [mine, top] = await Promise.all([
    cid ? prisma.gameScore.groupBy({ by: ["game"], where: { candidateId: cid }, _max: { score: true }, _count: true }) : [],
    prisma.gameScore.findMany({ orderBy: { score: "desc" }, take: 60, include: { candidate: { select: { fullName: true } } } }),
  ]);
  const best = new Map(mine.map((m) => [m.game, m._max.score ?? 0]));
  const plays = new Map(mine.map((m) => [m.game, m._count]));
  const short = (n: string) => { const p = n.trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; };

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Mini-games</h1>
      <p className="mb-6 text-sm text-ink/70">Quick, fun ways to lock in what you learn. Scores add to your XP.</p>
      <div className="grid gap-5 lg:grid-cols-3 stagger">
        {GAMES.map((g) => {
          const board: { name: string; score: number }[] = [];
          const seen = new Set<string>();
          for (const s of top.filter((t) => t.game === g.kind)) {
            if (seen.has(s.candidateId)) continue;
            seen.add(s.candidateId);
            board.push({ name: short(s.candidate.fullName), score: s.score });
            if (board.length === 3) break;
          }
          return (
            <section key={g.slug} className="card p-6">
              <p className="text-4xl">{g.icon}</p>
              <h2 className="mt-2 text-lg font-extrabold">{g.name}</h2>
              <p className="text-sm text-ink/70">{g.blurb}</p>
              <p className="mt-3 text-xs font-bold text-ink/60">Your best: <span className="text-brand">{best.get(g.kind) ?? "—"}</span> · {plays.get(g.kind) ?? 0} plays</p>
              {board.length > 0 && (
                <ol className="mt-3 space-y-1 text-xs">
                  {board.map((b, i) => (
                    <li key={i} className="flex justify-between rounded-[10px] bg-surface px-3 py-1.5"><span>{["🥇", "🥈", "🥉"][i]} {b.name}</span><strong>{b.score}</strong></li>
                  ))}
                </ol>
              )}
              <Link href={`/learn/games/${g.slug}`} className="btn btn-primary mt-4 w-full">Play</Link>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
