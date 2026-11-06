import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { credentialStatus, STATUS_BADGE } from "@/lib/credential-status";

export const metadata = { title: "Compliance" };

export default async function AdminCredentialsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { filter } = await searchParams;

  const all = await prisma.credential.findMany({
    include: { candidate: true, document: { select: { id: true, sharedWithAdmins: true } } },
    orderBy: [{ expiresAt: "asc" }],
  });
  const rows = all.map((c) => ({ c, s: credentialStatus(c.expiresAt) }));
  const shown = filter === "attention" ? rows.filter((r) => r.s.status === "expired" || r.s.status === "expiring") : rows;
  const count = (st: string) => rows.filter((r) => r.s.status === st).length;

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight">Certifications &amp; safety tickets</h1>
      <p className="mb-6 text-sm text-ink/70">Every credential candidates have recorded. Files appear only when the candidate chose to share them with admins.</p>
      <div className="mb-6 grid grid-cols-3 gap-4 stagger">
        <div className="card p-5"><p className="text-xs font-bold text-ink/60">Valid</p><p className="text-3xl font-extrabold">{count("valid") + count("no-expiry")}</p></div>
        <div className="card p-5"><p className="text-xs font-bold text-ink/60">Expiring ≤60 days</p><p className="text-3xl font-extrabold text-amber-600">{count("expiring")}</p></div>
        <div className="card p-5"><p className="text-xs font-bold text-ink/60">Expired</p><p className="text-3xl font-extrabold text-red-600">{count("expired")}</p></div>
      </div>
      <div className="mb-4 flex gap-2">
        <a href="/admin/credentials" className={`btn btn-sm ${!filter ? "btn-primary" : "btn-ghost"}`}>All</a>
        <a href="/admin/credentials?filter=attention" className={`btn btn-sm ${filter ? "btn-primary" : "btn-ghost"}`}>Needs attention</a>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink/60"><tr><th className="px-4 py-3">Person</th><th className="px-4 py-3">Credential</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th /></tr></thead>
          <tbody>
            {shown.map(({ c, s }) => {
              const [tone, label] = STATUS_BADGE[s.status];
              return (
                <tr key={c.id} className="border-t border-surface">
                  <td className="px-4 py-3"><p className="font-bold">{c.candidate.fullName}</p><p className="text-xs text-ink/50">{c.candidate.email}</p></td>
                  <td className="px-4 py-3">{c.name}{c.number && <span className="text-xs text-ink/50"> #{c.number}</span>}</td>
                  <td className="px-4 py-3 text-ink/70">{c.kind === "SAFETY_TICKET" ? "Safety ticket" : "Certification"}</td>
                  <td className="px-4 py-3">{c.expiresAt ? c.expiresAt.toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><span className={`badge ${tone}`}>{label}</span></td>
                  <td className="px-4 py-3">{c.document?.sharedWithAdmins && <a href={`/api/documents/${c.document.id}`} target="_blank" className="font-bold text-brand hover:underline">File</a>}</td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/50">Nothing to show.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
