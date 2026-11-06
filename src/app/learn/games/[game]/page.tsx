import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import SymbolMatchGame from "@/components/learning/SymbolMatchGame";
import SpeedRoundGame from "@/components/learning/SpeedRoundGame";
import ErrorHuntGame from "@/components/learning/ErrorHuntGame";

const TITLES: Record<string, string> = { "symbol-match": "Symbol Match", "speed-round": "Speed Round", "error-hunt": "Error Hunt" };

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { game } = await params;
  if (!TITLES[game]) notFound();
  return (
    <AppShell width="max-w-2xl">
      <Link href="/learn/games" className="text-sm font-semibold text-brand hover:underline">← All games</Link>
      <h1 className="mb-5 mt-2 text-2xl font-extrabold tracking-tight">{TITLES[game]}</h1>
      {session.user.role !== "CANDIDATE" ? (
        <p className="alert alert-info">Games are for candidate accounts (scores are saved to a candidate profile).</p>
      ) : game === "symbol-match" ? <SymbolMatchGame /> : game === "speed-round" ? <SpeedRoundGame /> : <ErrorHuntGame />}
    </AppShell>
  );
}
