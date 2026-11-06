import { setPasswordAction } from "@/app/actions/auth";
import AuthCard, { ErrorNote } from "@/components/ui/AuthCard";

export const metadata = { title: "Set password" };

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; reset?: string }>;
}) {
  const { token, error, reset } = await searchParams;
  if (!token) {
    return (
      <AuthCard title="Link missing a token" subtitle="Open the full link from your email, or request a new one from the log-in page." />
    );
  }
  return (
    <AuthCard
      title={reset ? "Reset your password" : "Set your password"}
      subtitle={reset ? "Choose a new password for your account." : "Set a password to finish setting up your Engrity account."}
    >
      <ErrorNote error={error} />
      <form action={setPasswordAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <p className="hint mt-1">At least 8 characters, with a letter and a number.</p>
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Save &amp; continue</button>
      </form>
    </AuthCard>
  );
}
