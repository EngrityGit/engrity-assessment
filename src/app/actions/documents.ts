"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readUpload } from "@/lib/files";

async function requireUser() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

// Candidates may only share with admins; admins may share with any user.
async function allowedRecipients(role: "ADMIN" | "CANDIDATE", ids: string[]) {
  if (ids.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: ids }, ...(role === "CANDIDATE" ? { role: "ADMIN" as const } : {}) },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function uploadDocument(formData: FormData) {
  const session = await requireUser();
  const back = session.user.role === "ADMIN" ? "/admin/documents" : "/documents";
  const file = formData.get("file");
  const upload = file instanceof File ? await readUpload(file) : ({ ok: false, error: "Choose a file to upload." } as const);
  if (!upload.ok) redirect(`${back}?error=${encodeURIComponent(upload.error)}`);

  const title = String(formData.get("title") ?? "").trim().slice(0, 120) || upload.name;
  const recipients = await allowedRecipients(session.user.role, formData.getAll("shareWith").map(String));

  await prisma.document.create({
    data: {
      ownerId: session.user.id,
      title,
      fileName: upload.name,
      mimeType: upload.mime,
      size: upload.data.length,
      data: new Uint8Array(upload.data),
      sharedWithAdmins: session.user.role === "CANDIDATE" && formData.get("shareAdmins") === "on",
      shares: { create: recipients.map((userId) => ({ userId })) },
    },
  });
  revalidatePath(back);
  redirect(`${back}?uploaded=1`);
}

export async function updateDocumentShares(formData: FormData) {
  const session = await requireUser();
  const doc = await prisma.document.findUnique({ where: { id: String(formData.get("documentId") ?? "") }, select: { id: true, ownerId: true } });
  const back = session.user.role === "ADMIN" ? "/admin/documents" : "/documents";
  if (!doc || doc.ownerId !== session.user.id) redirect(back);

  const recipients = await allowedRecipients(session.user.role, formData.getAll("shareWith").map(String));
  await prisma.$transaction([
    prisma.documentShare.deleteMany({ where: { documentId: doc.id } }),
    prisma.documentShare.createMany({ data: recipients.map((userId) => ({ documentId: doc.id, userId })) }),
    ...(session.user.role === "CANDIDATE"
      ? [prisma.document.update({ where: { id: doc.id }, data: { sharedWithAdmins: formData.get("shareAdmins") === "on" } })]
      : []),
  ]);
  revalidatePath(back);
  redirect(`${back}?shared=1`);
}

export async function deleteDocument(formData: FormData) {
  const session = await requireUser();
  const back = session.user.role === "ADMIN" ? "/admin/documents" : "/documents";
  const doc = await prisma.document.findUnique({ where: { id: String(formData.get("documentId") ?? "") }, select: { id: true, ownerId: true } });
  if (doc && doc.ownerId === session.user.id) await prisma.document.delete({ where: { id: doc.id } });
  revalidatePath(back);
  redirect(`${back}?deleted=1`);
}
