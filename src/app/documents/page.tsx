import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import DocumentsPanel from "@/components/DocumentsPanel";

export const metadata = { title: "Documents" };

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/documents");
  const sp = await searchParams;
  return (
    <AppShell width="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Documents</h1>
      <p className="mb-6 text-sm text-ink/70">Share files securely with Engrity admins — you decide who can open each one.</p>
      <DocumentsPanel userId={session.user.id} role="CANDIDATE" flash={sp} />
    </AppShell>
  );
}
