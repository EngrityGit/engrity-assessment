"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readUpload } from "@/lib/files";
import type { CredentialKind } from "@/generated/prisma/client";

async function requireCandidate() {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDATE" || !session.user.candidateId) redirect("/login");
  return session as typeof session & { user: { candidateId: string } };
}

const date = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  const d = s ? new Date(s) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

export async function addCredential(formData: FormData) {
  const session = await requireCandidate();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const kind: CredentialKind = formData.get("kind") === "SAFETY_TICKET" ? "SAFETY_TICKET" : "CERTIFICATION";
  if (!name) redirect("/credentials?error=Give+the+credential+a+name.");

  const issuedAt = date(formData.get("issuedAt"));
  const expiresAt = date(formData.get("expiresAt"));
  if (issuedAt && expiresAt && expiresAt < issuedAt) redirect("/credentials?error=Expiry+must+be+after+the+issue+date.");

  let documentId: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const upload = await readUpload(file);
    if (!upload.ok) redirect(`/credentials?error=${encodeURIComponent(upload.error)}`);
    const doc = await prisma.document.create({
      data: {
        ownerId: session.user.id,
        title: name,
        fileName: upload.name,
        mimeType: upload.mime,
        size: upload.data.length,
        data: new Uint8Array(upload.data),
        sharedWithAdmins: formData.get("shareAdmins") === "on",
      },
    });
    documentId = doc.id;
  }

  await prisma.credential.create({
    data: {
      candidateId: session.user.candidateId,
      kind,
      name,
      issuer: String(formData.get("issuer") ?? "").trim().slice(0, 120) || null,
      number: String(formData.get("number") ?? "").trim().slice(0, 80) || null,
      issuedAt,
      expiresAt,
      notes: String(formData.get("notes") ?? "").trim().slice(0, 500) || null,
      documentId,
    },
  });
  revalidatePath("/credentials");
  redirect("/credentials?added=1");
}

export async function deleteCredential(formData: FormData) {
  const session = await requireCandidate();
  await prisma.credential.deleteMany({ where: { id: String(formData.get("id") ?? ""), candidateId: session.user.candidateId } });
  revalidatePath("/credentials");
  redirect("/credentials?deleted=1");
}
