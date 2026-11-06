import Link from "next/link";
import { redirect } from "next/navigation";
import { signupCandidate } from "@/app/actions/auth";
import { openSignupAllowed } from "@/lib/signup-policy";
import AuthCard, { ErrorNote } from "@/components/ui/AuthCard";

export const metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!openSignupAllowed()) redirect("/request-access");
  const { error } = await searchParams;
  return (
    <AuthCard title="Create your account" subtitle="View and complete the assessments Engrity assigns to you, and use the training tools." wide>
      <ErrorNote error={error} />
      <form action={signupCandidate} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required autoComplete="name" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <p className="hint mt-1">At least 8 characters, with a letter and a number.</p>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#0071fe]" />
          <span>
            I agree that my assessment responses, interview recordings/transcripts, activity data and performance
            metrics may be collected and analysed (including by AI) by Engrity for evaluation purposes.
          </span>
        </label>
        <button type="submit" className="btn btn-primary w-full">Sign up</button>
      </form>
      <p className="mt-6 text-sm text-ink/70">
        Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}
