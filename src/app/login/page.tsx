import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import AuthCard, { ErrorNote } from "@/components/ui/AuthCard";
import PasswordInput from "@/components/ui/PasswordInput";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthCard title="Welcome back" subtitle="Candidates and Engrity staff both log in here.">
      <ErrorNote error={error} />
      <form action={loginAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">Log in</button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className="font-semibold text-brand hover:underline">Forgot password?</Link>
      </p>
      <p className="mt-2 text-sm text-ink/70">
        New here? <Link href="/signup" className="font-semibold text-brand hover:underline">Create an account</Link> or{" "}
        <Link href="/request-access" className="font-semibold text-brand hover:underline">request access</Link>.
      </p>
    </AuthCard>
  );
}