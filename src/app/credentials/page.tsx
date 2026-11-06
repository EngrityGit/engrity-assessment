import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { addCredential, deleteCredential } from "@/app/actions/credentials";
import { credentialStatus, STATUS_BADGE, COMMON_CREDENTIALS } from "@/lib/credential-status";

export const metadata = { title: "Credentials" };

export default async function CredentialsPage({ searchParams }: { searchParams: Promise<{ error?: string; added?: string; deleted?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/credentials");
  const { error, added, deleted } = await searchParams;

  const creds = await prisma.credential.findMany({
    where: { candidateId: session.user.candidateId! },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
  });
  const rows = creds.map((c) => ({ c, s: credentialStatus(c.expiresAt) }));
  const attention = rows.filter((r) => r.s.status === "expired" || r.s.status === "expiring").length;

  return (
    <AppShell width="max-w-4xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Certifications &amp; safety tickets</h1>
      <p className="mb-6 text-sm text-ink/70">Keep every ticket and certificate in one place and renew before they expire.</p>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {added && <div className="alert alert-ok mb-4">Credential added.</div>}
      {deleted && <div className="alert alert-ok mb-4">Credential removed.</div>}
      {attention > 0 && <div className="alert alert-info mb-4 anim-pop">{attention} credential{attention === 1 ? " needs" : "s need"} attention — expired or expiring within 60 days.</div>}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3 stagger">
          {rows.map(({ c, s }) => {
            const [tone, label] = STATUS_BADGE[s.status];
            return (
              <div key={c.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-ink/60">
                      {c.kind === "SAFETY_TICKET" ? "Safety ticket" : "Certification"}{c.issuer ? ` · ${c.issuer}` : ""}{c.number ? ` · #${c.number}` : ""}
                    </p>
                  </div>
                  <span className={`badge ${tone}`}>{label}{s.days !== null && s.status !== "expired" ? ` · ${s.days}d` : ""}{s.status === "expired" && s.days !== null ? ` · ${-s.days}d ago` : ""}</span>
                </div>
                <p className="mt-2 text-xs text-ink/60">
                  {c.issuedAt ? `Issued ${c.issuedAt.toLocaleDateString()}` : ""}{c.issuedAt && c.expiresAt ? " · " : ""}{c.expiresAt ? `Expires ${c.expiresAt.toLocaleDateString()}` : ""}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {c.documentId && <a href={`/api/documents/${c.documentId}`} target="_blank" className="text-xs font-bold text-brand hover:underline">View file</a>}
                  <form action={deleteCredential}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-xs font-bold text-red-600 hover:underline" type="submit">Remove</button>
                  </form>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && <p className="card p-8 text-center text-sm text-ink/50">No credentials yet. Add your first one →</p>}
        </section>

        <section className="card h-fit p-6 lg:col-span-2">
          <h2 className="mb-3 text-lg font-extrabold">Add a credential</h2>
          <form action={addCredential} className="space-y-3">
            <select name="kind" className="input" defaultValue="SAFETY_TICKET">
              <option value="SAFETY_TICKET">Safety ticket</option>
              <option value="CERTIFICATION">Certification</option>
            </select>
            <input name="name" list="cred-names" required placeholder="Name (e.g. H2S Alive)" className="input" />
            <datalist id="cred-names">{COMMON_CREDENTIALS.map((n) => <option key={n} value={n} />)}</datalist>
            <input name="issuer" placeholder="Issuer (optional)" className="input" />
            <input name="number" placeholder="Certificate / ticket number (optional)" className="input" />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Issued</label><input name="issuedAt" type="date" className="input" /></div>
              <div><label className="label">Expires</label><input name="expiresAt" type="date" className="input" /></div>
            </div>
            <div>
              <label className="label">Copy of the ticket (optional)</label>
              <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="input !py-2" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="shareAdmins" defaultChecked className="h-4 w-4 accent-[#0071fe]" /> Let Engrity admins view the file</label>
            <button className="btn btn-primary w-full" type="submit">Add credential</button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
