import Link from "next/link";
import { requestAccess } from "@/app/actions/auth";
import AuthCard, { ErrorNote } from "@/components/ui/AuthCard";
import { JOB_ROLE_LABELS } from "@/lib/quiz";

export const metadata = { title: "Request access" };

export default async function RequestAccessPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <AuthCard
      title="Request access"
      subtitle={sent ? undefined : "Tell us who you are. An Engrity admin will review your request and email you an invitation."}
      wide
    >
      {sent ? (
        <>
          <div className="alert alert-ok mb-5">Thanks — your request was sent. If approved, you&rsquo;ll receive an invitation by email.</div>
          <Link href="/login" className="btn btn-soft w-full">Back to log in</Link>
        </>
      ) : (
        <>
          <ErrorNote error={error} />
          <form action={requestAccess} className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="targetRole">Role you&rsquo;re applying for / working in</label>
              <select id="targetRole" name="targetRole" className="input" defaultValue="">
                <option value="">Not sure yet</option>
                {Object.entries(JOB_ROLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="message">Message (optional)</label>
              <textarea id="message" name="message" rows={3} maxLength={1000} className="input" placeholder="Who referred you? Which project or team?" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Send request</button>
          </form>
          <p className="mt-6 text-sm text-ink/70">
            Have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
