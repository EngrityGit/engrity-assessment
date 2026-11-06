import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { updateGroupMembers, assignGroup } from "@/app/actions/admin";

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; assigned?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const { saved, assigned } = await searchParams;

  const [group, candidates] = await Promise.all([
    prisma.group.findUnique({ where: { id }, include: { members: true } }),
    prisma.candidate.findMany({ orderBy: { fullName: "asc" } }),
  ]);
  if (!group) notFound();
  const memberIds = new Set(group.members.map((m) => m.candidateId));

  return (
    <AppShell width="max-w-3xl">
      <Link href="/admin/groups" className="text-sm font-semibold text-brand hover:underline">← All groups</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold tracking-tight">{group.name}</h1>
      <div className="space-y-6">
        {saved && <div className="alert alert-ok">Members saved.</div>}
        {assigned && <div className="alert alert-ok">Assessment assigned to every member.</div>}

        <form action={updateGroupMembers} className="card p-6">
          <input type="hidden" name="groupId" value={group.id} />
          <h2 className="mb-3 text-lg font-extrabold">Members ({memberIds.size})</h2>
          <div className="grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">
            {candidates.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-[15px] bg-surface px-3 py-2 text-sm">
                <input type="checkbox" name="candidateId" value={c.id} defaultChecked={memberIds.has(c.id)} className="h-4 w-4 accent-[#0071fe]" />
                <span><span className="font-semibold">{c.fullName}</span><span className="block text-xs text-ink/60">{c.email}</span></span>
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-primary mt-4">Save members</button>
        </form>

        <form action={assignGroup} className="card-accent flex flex-wrap items-end gap-3 p-6">
          <input type="hidden" name="groupId" value={group.id} />
          <div>
            <label className="label" htmlFor="dueAt">Due date (optional)</label>
            <input id="dueAt" type="date" name="dueAt" className="input" />
          </div>
          <button type="submit" className="btn btn-primary">Assign standard assessment to all members</button>
        </form>
      </div>
    </AppShell>
  );
}
