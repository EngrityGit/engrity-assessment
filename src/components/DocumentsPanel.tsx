import { prisma } from "@/lib/prisma";
import { uploadDocument, updateDocumentShares, deleteDocument } from "@/app/actions/documents";

const fmtSize = (b: number) => (b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`);

export default async function DocumentsPanel({ userId, role, flash }: { userId: string; role: "ADMIN" | "CANDIDATE"; flash: { error?: string; uploaded?: string; shared?: string; deleted?: string } }) {
  const isAdmin = role === "ADMIN";
  const select = { id: true, title: true, fileName: true, mimeType: true, size: true, createdAt: true, sharedWithAdmins: true, ownerId: true } as const;

  const [recipients, mine, incoming] = await Promise.all([
    prisma.user.findMany({
      where: isAdmin ? { id: { not: userId } } : { role: "ADMIN" },
      select: { id: true, email: true, role: true, candidate: { select: { fullName: true } } },
      orderBy: { email: "asc" },
    }),
    prisma.document.findMany({ where: { ownerId: userId }, select: { ...select, shares: { select: { userId: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.document.findMany({
      where: {
        ownerId: { not: userId },
        OR: [{ shares: { some: { userId } } }, ...(isAdmin ? [{ sharedWithAdmins: true }] : [])],
      },
      select: { ...select, owner: { select: { email: true, candidate: { select: { fullName: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const label = (u: { email: string; candidate: { fullName: string } | null }) => (u.candidate?.fullName ? `${u.candidate.fullName} (${u.email})` : u.email);

  return (
    <div className="space-y-8">
      {flash.error && <div className="alert alert-error">{flash.error}</div>}
      {(flash.uploaded || flash.shared || flash.deleted) && <div className="alert alert-ok">{flash.uploaded ? "Document uploaded." : flash.shared ? "Sharing updated." : "Document deleted."}</div>}

      <section className="card p-6">
        <h2 className="text-lg font-extrabold">Upload a document</h2>
        <p className="mb-4 text-sm text-ink/70">
          {isAdmin ? "Upload a document and choose exactly who can open it." : "Upload a document and choose who can see it. Only people you pick can open it."} PDF, PNG, JPG, WEBP or DOCX, up to 4 MB.
        </p>
        <form action={uploadDocument} className="grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Title (optional)" className="input" />
          <input name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp,.docx" className="input !py-2" />
          <div className="sm:col-span-2">
            {!isAdmin && (
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="shareAdmins" className="h-4 w-4 accent-[#0071fe]" /> Share with all Engrity admins
              </label>
            )}
            <label className="label">{isAdmin ? "Share with specific people" : "…or share with specific admins"}</label>
            <div className="grid max-h-44 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {recipients.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded-[12px] bg-surface px-3 py-1.5 text-xs">
                  <input type="checkbox" name="shareWith" value={r.id} className="h-4 w-4 accent-[#0071fe]" /> {label(r)}
                </label>
              ))}
              {recipients.length === 0 && <p className="text-xs text-ink/50">No one to share with yet.</p>}
            </div>
          </div>
          <button className="btn btn-primary sm:col-span-2" type="submit">Upload</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">{isAdmin ? "Documents you uploaded" : "My documents"}</h2>
        <div className="space-y-3 stagger">
          {mine.map((d) => (
            <div key={d.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <a href={`/api/documents/${d.id}`} target="_blank" className="font-bold text-brand hover:underline">{d.title}</a>
                  <p className="text-xs text-ink/60">{d.fileName} · {fmtSize(d.size)} · {d.createdAt.toLocaleDateString()}</p>
                </div>
                <form action={deleteDocument}>
                  <input type="hidden" name="documentId" value={d.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">Delete</button>
                </form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-bold text-brand">
                  Sharing: {d.sharedWithAdmins ? "all admins" : ""}{d.sharedWithAdmins && d.shares.length ? " + " : ""}{d.shares.length ? `${d.shares.length} specific` : ""}{!d.sharedWithAdmins && d.shares.length === 0 ? "only you" : ""} — edit
                </summary>
                <form action={updateDocumentShares} className="mt-3 space-y-2">
                  <input type="hidden" name="documentId" value={d.id} />
                  {!isAdmin && (
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" name="shareAdmins" defaultChecked={d.sharedWithAdmins} className="h-4 w-4 accent-[#0071fe]" /> All Engrity admins
                    </label>
                  )}
                  <div className="grid max-h-40 gap-1.5 overflow-y-auto sm:grid-cols-2">
                    {recipients.map((r) => (
                      <label key={r.id} className="flex items-center gap-2 rounded-[12px] bg-surface px-3 py-1.5 text-xs">
                        <input type="checkbox" name="shareWith" value={r.id} defaultChecked={d.shares.some((s) => s.userId === r.id)} className="h-4 w-4 accent-[#0071fe]" /> {label(r)}
                      </label>
                    ))}
                  </div>
                  <button className="btn btn-soft btn-sm" type="submit">Save sharing</button>
                </form>
              </details>
            </div>
          ))}
          {mine.length === 0 && <p className="card p-6 text-center text-sm text-ink/50">Nothing uploaded yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">{isAdmin ? "Shared with admins / with you" : "Shared with me"}</h2>
        <div className="space-y-3 stagger">
          {incoming.map((d) => (
            <div key={d.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <a href={`/api/documents/${d.id}`} target="_blank" className="font-bold text-brand hover:underline">{d.title}</a>
                <p className="text-xs text-ink/60">From {label(d.owner)} · {fmtSize(d.size)} · {d.createdAt.toLocaleDateString()}</p>
              </div>
              <a href={`/api/documents/${d.id}`} target="_blank" className="btn btn-soft btn-sm">Open</a>
            </div>
          ))}
          {incoming.length === 0 && <p className="card p-6 text-center text-sm text-ink/50">Nothing has been shared with you yet.</p>}
        </div>
      </section>
    </div>
  );
}
