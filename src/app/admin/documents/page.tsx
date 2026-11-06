import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import DocumentsPanel from "@/components/DocumentsPanel";

export const metadata = { title: "Documents" };

export default async function AdminDocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const sp = await searchParams;
  return (
    <AppShell width="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Documents</h1>
      <p className="mb-6 text-sm text-ink/70">Share policies, procedures or offer documents with specific people — and open files candidates share with you.</p>
      <DocumentsPanel userId={session.user.id} role="ADMIN" flash={sp} />
    </AppShell>
  );
}
