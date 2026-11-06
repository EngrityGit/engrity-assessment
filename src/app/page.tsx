import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TOTAL_TIME_MINUTES, ROUND_ORDER, ROUND_LABELS } from "@/lib/quiz";

const FEATURES = [
  { t: "Guided assessments", d: "Every round starts with a short walkthrough, tips and a practice example so nobody is surprised." },
  { t: "AI voice interview", d: "A technical screening conversation that asks, listens and rates against role criteria." },
  { t: "Learn your trade", d: "Lessons on P&IDs, isometrics, MTRs, WPS/PQR and more — with an AI coach and mini-games." },
  { t: "Certs & safety tickets", d: "Track expiry dates, store proof, and share documents securely with Engrity." },
];

export default async function Home() {
  const session = await auth();
  if (session) redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent blur-3xl anim-float" />
      <div className="pointer-events-none absolute -right-24 top-40 h-[24rem] w-[24rem] rounded-full bg-brand/15 blur-3xl anim-float" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <Image src="/engrity-logo.png" alt="Engrity" width={38} height={38} className="rounded-[12px]" />
          <span className="font-extrabold tracking-tight">Engrity</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Sign up</Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:pt-16">
        <span className="badge badge-blue anim-fade-up">Reliable. Fast. Competent.</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl anim-fade-up">
          Prove your skills. <span className="text-brand">Grow your career.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-ink/70 anim-fade-up">
          The Engrity platform for assessments, AI-assisted interviews, training and compliance — built for inspection,
          NDT, welding and quality teams.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 anim-fade-up">
          <Link href="/signup" className="btn btn-primary !px-6 !py-3">Create account</Link>
          <Link href="/request-access" className="btn btn-soft !px-6 !py-3">Request access</Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4 stagger">
        {FEATURES.map((f) => (
          <div key={f.t} className="card card-hover p-6">
            <div className="mb-3 h-10 w-10 rounded-[12px] bg-accent" />
            <h3 className="font-extrabold">{f.t}</h3>
            <p className="mt-1 text-sm text-ink/70">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto max-w-3xl px-4 pb-20">
        <div className="card-accent p-8">
          <h2 className="text-xl font-extrabold">The assessment (about {TOTAL_TIME_MINUTES} minutes)</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {ROUND_ORDER.map((r, i) => (
              <li key={r} className="flex items-center gap-3 rounded-[15px] bg-white px-4 py-3 text-sm font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs text-white">{i + 1}</span>
                {ROUND_LABELS[r]}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink/70">
            Role-specific technical screening is added for some roles. Use of AI tools, other tabs or outside help during
            a test is not allowed and is monitored.
          </p>
        </div>
      </section>
    </div>
  );
}
