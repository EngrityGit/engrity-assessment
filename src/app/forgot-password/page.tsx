import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import AuthCard from "@/components/ui/AuthCard";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle={sent ? undefined : "Enter your account email and we'll send you a reset link."}
    >
      {sent ? (
        <>
          <div className="alert alert-ok mb-5">
            If an account exists for that email, a reset link is on its way. It expires in 1 hour.
          </div>
          <Link href="/login" className="btn btn-soft w-full">Back to log in</Link>
        </>
      ) : (
        <>
          <form action={requestPasswordReset} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Send reset link</button>
          </form>
          <p className="mt-6 text-sm">
            <Link href="/login" className="font-semibold text-brand hover:underline">← Back to log in</Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
