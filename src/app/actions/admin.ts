"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobRole } from "@/generated/prisma/client";
import { sendWelcomeEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

// Same lifetime as the migrated-account setup links — long enough that a new
// hire doesn't have to act on it the same day.
const ACCOUNT_SETUP_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function createCandidateAccount(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!fullName || !email) {
    redirect("/admin?createError=Please+enter+a+name+and+email.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin?createError=An+account+with+this+email+already+exists.");
  }

  const token = randomBytes(32).toString("base64url");
  const user = await prisma.user.create({
    data: {
      email,
      role: "CANDIDATE",
      passwordSetupToken: token,
      passwordSetupExpires: new Date(Date.now() + ACCOUNT_SETUP_TOKEN_LIFETIME_MS),
      candidate: {
        create: { fullName, email },
      },
    },
  });

  const setupUrl = `${await getBaseUrl()}/set-password?token=${token}`;

  // Non-blocking, same pattern as password reset — a missing/failing email
  // provider must never block account creation. The setup link is also
  // shown directly on the admin page (below) so it never depends on email
  // actually sending.
  await sendWelcomeEmail({ to: user.email, fullName, setupUrl });

  revalidatePath("/admin");
  redirect(`/admin?created=1&setupUrl=${encodeURIComponent(setupUrl)}&createdName=${encodeURIComponent(fullName)}`);
}

// For an existing candidate who never finished setting a password, forgot
// it, or is stuck on an already-used link — generates a fresh one-time
// setup link the admin can hand off directly (same non-blocking-email
// pattern as account creation and the candidate-facing forgot-password
// flow, but the link is surfaced to the admin instead of only emailed).
export async function resendSetupLink(formData: FormData) {
  await requireAdmin();

  const candidateId = String(formData.get("candidateId") ?? "");
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) redirect("/admin");

  const token = randomBytes(32).toString("base64url");
  await prisma.user.update({
    where: { id: candidate!.userId },
    data: {
      passwordSetupToken: token,
      passwordSetupExpires: new Date(Date.now() + ACCOUNT_SETUP_TOKEN_LIFETIME_MS),
    },
  });

  const setupUrl = `${await getBaseUrl()}/set-password?token=${token}&reset=1`;

  await sendWelcomeEmail({ to: candidate!.email, fullName: candidate!.fullName, setupUrl });

  revalidatePath("/admin");
  redirect(`/admin?resent=1&setupUrl=${encodeURIComponent(setupUrl)}&createdName=${encodeURIComponent(candidate!.fullName)}`);
}

export async function assignCandidate(formData: FormData) {
  await requireAdmin();

  const candidateId = String(formData.get("candidateId") ?? "");
  const dueAtRaw = String(formData.get("dueAt") ?? "");

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) redirect("/admin");

  await prisma.assignment.create({
    data: {
      candidateId,
      dueAt: dueAtRaw ? new Date(dueAtRaw) : null,
      technicalOnly: formData.get("technicalOnly") === "on",
    },
  });

  revalidatePath("/admin");
  redirect("/admin?assigned=1");
}

export async function setCandidateTargetRole(formData: FormData) {
  await requireAdmin();

  const candidateId = String(formData.get("candidateId") ?? "");
  const targetRoleRaw = String(formData.get("targetRole") ?? "");
  const targetRole = targetRoleRaw && targetRoleRaw in JobRole ? (targetRoleRaw as JobRole) : null;

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) redirect("/admin");

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { targetRole },
  });

  revalidatePath("/admin");
}

export async function createGroup(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/groups?error=Please+enter+a+group+name.");

  const group = await prisma.group.create({ data: { name } });

  revalidatePath("/admin/groups");
  redirect(`/admin/groups/${group.id}`);
}

export async function updateGroupMembers(formData: FormData) {
  await requireAdmin();

  const groupId = String(formData.get("groupId") ?? "");
  const candidateIds = formData.getAll("candidateId").map(String);

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) redirect("/admin/groups");

  await prisma.$transaction([
    prisma.groupMember.deleteMany({ where: { groupId } }),
    prisma.groupMember.createMany({
      data: candidateIds.map((candidateId) => ({ groupId, candidateId })),
    }),
  ]);

  revalidatePath(`/admin/groups/${groupId}`);
  redirect(`/admin/groups/${groupId}?saved=1`);
}

export async function assignGroup(formData: FormData) {
  await requireAdmin();

  const groupId = String(formData.get("groupId") ?? "");
  const dueAtRaw = String(formData.get("dueAt") ?? "");
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) redirect("/admin/groups");

  await prisma.assignment.createMany({
    data: group!.members.map((m) => ({ candidateId: m.candidateId, dueAt })),
  });

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin");
  redirect(`/admin/groups/${groupId}?assigned=1`);
}
