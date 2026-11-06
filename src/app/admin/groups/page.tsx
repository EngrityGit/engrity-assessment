import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/ui/AppShell";
import { createGroup } from "@/app/actions/admin";

export const metadata = { title: "Groups" };

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const groups = await prisma.group.findMany({ include: { members: true }, orderBy: { createdAt: "desc" } });

  return (
    <AppShell width="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Candidate groups</h1>
      <p className="mb-6 text-sm text-ink/70">Assign the standard assessment to a whole cohort at once.</p>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <form action={createGroup} className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <input name="name" required placeholder="e.g. Junior Welding Inspectors" className="input min-w-[14rem] flex-1" />
        <button type="submit" className="btn btn-primary">Create group</button>
      </form>
      <div className="space-y-3 stagger">
        {groups.map((g) => (
          <Link key={g.id} href={`/admin/groups/${g.id}`} className="card card-hover block p-5">
            <p className="font-bold">{g.name}</p>
            <p className="text-xs text-ink/60">{g.members.length} member{g.members.length === 1 ? "" : "s"}</p>
          </Link>
        ))}
        {groups.length === 0 && <p className="card p-8 text-center text-ink/50">No groups yet.</p>}
      </div>
    </AppShell>
  );
}
