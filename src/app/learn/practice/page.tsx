import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import PracticeClient from "@/components/learning/PracticeClient";

export const metadata = { title: "AI practice" };

export default async function PracticePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <AppShell width="max-w-3xl">
      <Link href="/learn" className="text-sm font-semibold text-brand hover:underline">← Learning hub</Link>
      <h1 className="mb-1 mt-2 text-2xl font-extrabold tracking-tight">AI practice</h1>
      <p className="mb-6 text-sm text-ink/70">Pick a topic and the AI writes a fresh set of questions with explanations. Not available during a live assessment.</p>
      {session.user.role === "CANDIDATE" ? <PracticeClient /> : <p className="alert alert-info">Practice is for candidate accounts.</p>}
    </AppShell>
  );
}
