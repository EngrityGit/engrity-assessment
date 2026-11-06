import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { acceptInvite } from "@/app/actions/auth";
import AuthCard, { ErrorNote } from "@/components/ui/AuthCard";
import { JOB_ROLE_LABELS } from "@/lib/quiz";

export const metadata = { title: "Accept invitation" };

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const invite = await prisma.invitation.findUnique({ where: { token } });
  const valid = invite && !invite.revokedAt && invite.expiresAt > new Date() && invite.uses < invite.maxUses;

  if (!valid) {
    return (
      <AuthCard title="Invitation unavailable" subtitle="This invitation has expired, been used up, or was cancelled. Ask your Engrity contact for a new one.">
        <Link href="/login" className="btn btn-soft w-full">Go to log in</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={invite.role === "ADMIN" ? "Join Engrity as an admin" : "You're invited to Engrity"}
      subtitle="Create your account to get started."
      wide
    >
      <ErrorNote error={error} />
      {invite.note && <div className="alert alert-info mb-4">{invite.note}</div>}
      {invite.targetRole && (
        <p className="mb-4 text-sm text-ink/70">
          Role: <span className="badge badge-blue">{JOB_ROLE_LABELS[invite.targetRole]}</span>
        </p>
      )}
      <form action={acceptInvite} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required defaultValue={invite.fullName ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          {invite.email ? (
            <input id="email" value={invite.email} readOnly className="input bg-surface" />
          ) : (
            <input id="email" name="email" type="email" required className="input" />
          )}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <p className="hint mt-1">At least 8 characters, with a letter and a number.</p>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#0071fe]" />
          <span>I agree that my assessment responses, interview transcripts and performance data may be collected and analysed (including by AI) by Engrity for evaluation.</span>
        </label>
        <button type="submit" className="btn btn-primary w-full">Create account</button>
      </form>
    </AuthCard>
  );
}
