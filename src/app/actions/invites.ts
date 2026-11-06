"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobRole } from "@/generated/prisma/client";
import { sendInvitationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  return session;
}

const DAY = 24 * 60 * 60 * 1000;
const enc = encodeURIComponent;
const parseRole = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return s in JobRole ? (s as JobRole) : null;
};
const days = (v: FormDataEntryValue | null, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 90 ? Math.floor(n) : fallback;
};

// Single-use invitation sent to one email address (candidate or admin).
export async function createEmailInvitation(formData: FormData) {
  const session = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "CANDIDATE";

  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/admin/invitations?error=Enter+a+valid+email+address.");
  if (await prisma.user.findUnique({ where: { email } })) redirect("/admin/invitations?error=That+email+already+has+an+account.");

  const invite = await prisma.invitation.create({
    data: {
      token: randomBytes(32).toString("base64url"),
      email,
      fullName,
      note,
      role,
      targetRole: role === "CANDIDATE" ? parseRole(formData.get("targetRole")) : null,
      assignStandard: role === "CANDIDATE" && formData.get("assign") === "standard",
      technicalOnly: role === "CANDIDATE" && formData.get("assign") === "technical",
      groupId: String(formData.get("groupId") ?? "") || null,
      expiresAt: new Date(Date.now() + days(formData.get("days"), 7) * DAY),
      createdById: session.user.id,
    },
  });

  const url = `${await getBaseUrl()}/invite/${invite.token}`;
  const sent = await sendInvitationEmail({ to: email, fullName, inviteUrl: url, note, invitedBy: "an Engrity admin" });
  if (sent) await prisma.invitation.update({ where: { id: invite.id }, data: { emailedAt: new Date() } });

  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations?created=${enc(url)}&emailed=${sent ? 1 : 0}`);
}

// Multi-use link anyone can open — candidates only (admin accounts need a personal invite).
export async function createShareLink(formData: FormData) {
  const session = await requireAdmin();
  const maxUsesRaw = Number(formData.get("maxUses"));
  const maxUses = Number.isFinite(maxUsesRaw) ? Math.max(1, Math.min(500, Math.floor(maxUsesRaw))) : 10;

  const invite = await prisma.invitation.create({
    data: {
      token: randomBytes(32).toString("base64url"),
      role: "CANDIDATE",
      note: String(formData.get("note") ?? "").trim().slice(0, 500) || null,
      targetRole: parseRole(formData.get("targetRole")),
      assignStandard: formData.get("assign") === "standard",
      technicalOnly: formData.get("assign") === "technical",
      groupId: String(formData.get("groupId") ?? "") || null,
      maxUses,
      expiresAt: new Date(Date.now() + days(formData.get("days"), 14) * DAY),
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations?created=${enc(`${await getBaseUrl()}/invite/${invite.token}`)}&share=1`);
}

export async function revokeInvitation(formData: FormData) {
  await requireAdmin();
  await prisma.invitation.updateMany({
    where: { id: String(formData.get("id") ?? ""), revokedAt: null },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/admin/invitations");
  redirect("/admin/invitations?revoked=1");
}

export async function approveAccessRequest(formData: FormData) {
  const session = await requireAdmin();
  const req = await prisma.accessRequest.findUnique({ where: { id: String(formData.get("id") ?? "") } });
  if (!req || req.status !== "PENDING") redirect("/admin/invitations");

  if (await prisma.user.findUnique({ where: { email: req.email } })) {
    await prisma.accessRequest.update({ where: { id: req.id }, data: { status: "DECLINED", reviewedAt: new Date() } });
    redirect("/admin/invitations?error=That+person+already+has+an+account.");
  }

  const invite = await prisma.invitation.create({
    data: {
      token: randomBytes(32).toString("base64url"),
      email: req.email,
      fullName: req.fullName,
      role: "CANDIDATE",
      targetRole: req.targetRole,
      assignStandard: formData.get("assign") === "standard",
      technicalOnly: formData.get("assign") === "technical",
      expiresAt: new Date(Date.now() + 7 * DAY),
      createdById: session.user.id,
    },
  });
  const url = `${await getBaseUrl()}/invite/${invite.token}`;
  const sent = await sendInvitationEmail({ to: req.email, fullName: req.fullName, inviteUrl: url, invitedBy: "an Engrity admin" });
  await prisma.$transaction([
    prisma.accessRequest.update({ where: { id: req.id }, data: { status: "APPROVED", reviewedAt: new Date(), invitationId: invite.id } }),
    prisma.invitation.update({ where: { id: invite.id }, data: { emailedAt: sent ? new Date() : null } }),
  ]);

  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations?created=${enc(url)}&emailed=${sent ? 1 : 0}`);
}

export async function declineAccessRequest(formData: FormData) {
  await requireAdmin();
  await prisma.accessRequest.updateMany({
    where: { id: String(formData.get("id") ?? ""), status: "PENDING" },
    data: { status: "DECLINED", reviewedAt: new Date() },
  });
  revalidatePath("/admin/invitations");
  redirect("/admin/invitations");
}
