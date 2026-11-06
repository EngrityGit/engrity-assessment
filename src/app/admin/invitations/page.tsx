import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import CopyField from "@/components/ui/CopyField";
import { JOB_ROLE_LABELS } from "@/lib/quiz";
import { emailEnabled } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import {
  createEmailInvitation,
  createShareLink,
  revokeInvitation,
  approveAccessRequest,
  declineAccessRequest,
} from "@/app/actions/invites";

export const metadata = { title: "Invitations" };

function RoleSelect({ name = "targetRole" }: { name?: string }) {
  return (
    <select name={name} className="input" defaultValue="">
      <option value="">Target role: not set</option>
      {Object.entries(JOB_ROLE_LABELS).map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

function AssignSelect() {
  return (
    <select name="assign" className="input" defaultValue="">
      <option value="">Don&rsquo;t assign a test yet</option>
      <option value="standard">Assign standard assessment</option>
      <option value="technical">Assign technical screening only</option>
    </select>
  );
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; emailed?: string; share?: string; error?: string; revoked?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { created, emailed, share, error, revoked } = await searchParams;

  const [invites, requests, groups, base] = await Promise.all([
    prisma.invitation.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.accessRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
    getBaseUrl(),
  ]);
  const now = new Date();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Invitations &amp; access</h1>
        <p className="text-sm text-ink/70">Invite people by email, share a join link, or approve access requests.</p>
      </div>

      <div className="space-y-6">
        {error && <div className="alert alert-error">{error}</div>}
        {revoked && <div className="alert alert-ok">Invitation revoked.</div>}
        {created && (
          <div className="alert alert-ok anim-pop">
            <p className="font-bold">
              {share ? "Share link created." : emailed === "1" ? "Invitation emailed." : emailEnabled ? "Email could not be sent — share the link manually." : "Email isn't configured — share the link manually."}
            </p>
            <div className="mt-2"><CopyField value={created} /></div>
          </div>
        )}

        {requests.length > 0 && (
          <section className="card p-6">
            <h2 className="mb-3 text-lg font-extrabold">Access requests <span className="badge badge-amber ml-1">{requests.length}</span></h2>
            <div className="space-y-3 stagger">
              {requests.map((r) => (
                <div key={r.id} className="card-soft flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold">{r.fullName} <span className="font-normal text-ink/60">· {r.email}</span></p>
                    <p className="text-xs text-ink/60">
                      {r.targetRole ? JOB_ROLE_LABELS[r.targetRole] : "No role given"} · {r.createdAt.toLocaleDateString()}
                    </p>
                    {r.message && <p className="mt-1 text-sm text-ink/80">&ldquo;{r.message}&rdquo;</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={approveAccessRequest} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="assign" className="input !w-auto !py-1.5 text-xs" defaultValue="">
                        <option value="">No test yet</option>
                        <option value="standard">+ Standard assessment</option>
                        <option value="technical">+ Technical only</option>
                      </select>
                      <button className="btn btn-primary btn-sm" type="submit">Approve &amp; invite</button>
                    </form>
                    <form action={declineAccessRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn btn-ghost btn-sm" type="submit">Decline</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-lg font-extrabold">Invite by email</h2>
            <p className="mb-4 text-sm text-ink/70">One personal, single-use link sent to their inbox.</p>
            <form action={createEmailInvitation} className="space-y-3">
              <input name="fullName" placeholder="Full name (optional)" className="input" />
              <input name="email" type="email" required placeholder="Email address" className="input" />
              <div className="grid grid-cols-2 gap-3">
                <select name="role" className="input" defaultValue="CANDIDATE">
                  <option value="CANDIDATE">Candidate / employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <RoleSelect />
              </div>
              <AssignSelect />
              <div className="grid grid-cols-2 gap-3">
                <select name="groupId" className="input" defaultValue="">
                  <option value="">No group</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input name="days" type="number" min={1} max={90} defaultValue={7} className="input" title="Days until expiry" />
              </div>
              <textarea name="note" rows={2} maxLength={500} placeholder="Personal note shown on the invite (optional)" className="input" />
              <button type="submit" className="btn btn-primary w-full">Send invitation</button>
            </form>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-extrabold">Create a share link</h2>
            <p className="mb-4 text-sm text-ink/70">Anyone with the link can join as a candidate, up to the limit you set. Great for a cohort or job fair.</p>
            <form action={createShareLink} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <RoleSelect />
                <AssignSelect />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Max sign-ups</label>
                  <input name="maxUses" type="number" min={1} max={500} defaultValue={10} className="input" />
                </div>
                <div>
                  <label className="label">Expires (days)</label>
                  <input name="days" type="number" min={1} max={90} defaultValue={14} className="input" />
                </div>
                <div>
                  <label className="label">Group</label>
                  <select name="groupId" className="input" defaultValue="">
                    <option value="">None</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <textarea name="note" rows={2} maxLength={500} placeholder="Note shown on the join page (optional)" className="input" />
              <button type="submit" className="btn btn-primary w-full">Generate link</button>
            </form>
          </section>
        </div>

        <section className="card p-6">
          <h2 className="mb-3 text-lg font-extrabold">Recent invitations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink/60">
                <tr><th className="py-2 pr-4">For</th><th className="pr-4">Type</th><th className="pr-4">Used</th><th className="pr-4">Status</th><th className="pr-4">Link</th><th /></tr>
              </thead>
              <tbody>
                {invites.map((i) => {
                  const status = i.revokedAt ? "Revoked" : i.expiresAt < now ? "Expired" : i.uses >= i.maxUses ? "Used up" : "Active";
                  const active = status === "Active";
                  return (
                    <tr key={i.id} className="border-t border-surface">
                      <td className="py-3 pr-4 font-semibold">{i.email ?? "Share link"}{i.role === "ADMIN" && <span className="badge badge-blue ml-2">Admin</span>}</td>
                      <td className="pr-4 text-ink/70">{i.email ? (i.emailedAt ? "Emailed" : "Link only") : "Multi-use"}</td>
                      <td className="pr-4">{i.uses}/{i.maxUses}</td>
                      <td className="pr-4"><span className={`badge ${active ? "badge-green" : "badge-gray"}`}>{status}</span></td>
                      <td className="max-w-[14rem] pr-4">{active ? <CopyField value={`${base}/invite/${i.token}`} /> : <span className="text-ink/40">—</span>}</td>
                      <td>
                        {active && (
                          <form action={revokeInvitation}>
                            <input type="hidden" name="id" value={i.id} />
                            <button className="btn btn-ghost btn-sm" type="submit">Revoke</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {invites.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink/50">No invitations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
