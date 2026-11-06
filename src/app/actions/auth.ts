"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendAccessRequestNotice } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import { validatePassword } from "@/lib/password";
import { openSignupAllowed } from "@/lib/signup-policy";
import { JobRole } from "@/generated/prisma/client";

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000; // 1 hour
const enc = encodeURIComponent;
const BCRYPT_COST = 12;

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=Invalid+email+or+password.");
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  redirect(user?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function signupCandidate(formData: FormData) {
  if (!openSignupAllowed()) redirect("/request-access");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";

  if (!fullName || !email || !password) redirect("/signup?error=Please+fill+in+all+fields.");
  const pwError = validatePassword(password);
  if (pwError) redirect(`/signup?error=${enc(pwError)}`);
  if (!consent) redirect("/signup?error=You+must+agree+to+the+data+usage+terms+to+create+an+account.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/signup?error=An+account+with+this+email+already+exists.");

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      role: "CANDIDATE",
      candidate: { create: { fullName, email } },
    },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=Account+created.+Please+log+in.");
    throw error;
  }
  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Same confirmation either way — never reveal whether an email has an account.
    if (user) {
      const token = randomBytes(32).toString("base64url");
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordSetupToken: token, passwordSetupExpires: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS) },
      });
      const resetUrl = `${await getBaseUrl()}/set-password?token=${token}&reset=1`;
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    }
  }
  redirect("/forgot-password?sent=1");
}

export async function setPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? password);

  const pwError = validatePassword(password);
  if (pwError) redirect(`/set-password?token=${enc(token)}&error=${enc(pwError)}`);
  if (password !== confirm) redirect(`/set-password?token=${enc(token)}&error=Passwords+do+not+match.`);

  const user = await prisma.user.findUnique({ where: { passwordSetupToken: token } });
  if (!user || !user.passwordSetupExpires || user.passwordSetupExpires < new Date()) {
    redirect("/login?error=This+setup+link+is+invalid+or+has+expired.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, BCRYPT_COST), passwordSetupToken: null, passwordSetupExpires: null },
  });

  try {
    await signIn("credentials", { email: user.email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=Password+set.+Please+log+in.");
    throw error;
  }
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

// Someone without an invite asks an admin for access.
export async function requestAccess(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  const roleRaw = String(formData.get("targetRole") ?? "");
  const targetRole = roleRaw in JobRole ? (roleRaw as JobRole) : null;

  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) redirect("/request-access?error=Please+enter+your+name+and+a+valid+email.");

  const [existingUser, pending] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.accessRequest.findFirst({ where: { email, status: "PENDING" } }),
  ]);

  // Identical confirmation whether or not we act, so accounts can't be probed.
  if (!existingUser && !pending) {
    await prisma.accessRequest.create({ data: { fullName, email, message: message || null, targetRole } });
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
    const to = process.env.ADMIN_NOTIFY_EMAIL ? [process.env.ADMIN_NOTIFY_EMAIL] : admins.map((a) => a.email);
    await sendAccessRequestNotice({ to, fullName, email, adminUrl: `${await getBaseUrl()}/admin/invitations` });
  }
  redirect("/request-access?sent=1");
}

// Accepts an invitation (email-specific or share link).
export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";
  const back = (msg: string) => redirect(`/invite/${enc(token)}?error=${enc(msg)}`);

  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite || invite.revokedAt || invite.expiresAt < new Date() || invite.uses >= invite.maxUses) {
    redirect("/login?error=This+invitation+is+invalid+or+has+expired.");
  }

  const email = (invite.email ?? String(formData.get("email") ?? "")).trim().toLowerCase();
  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) back("Please enter your name and a valid email.");
  const pwError = validatePassword(password);
  if (pwError) back(pwError);
  if (!consent) back("You must agree to the data usage terms.");

  if (await prisma.user.findUnique({ where: { email } })) back("An account with this email already exists — log in instead.");

  // Atomically claim a use so two people can't both consume the last slot.
  const claimed = await prisma.$executeRaw`UPDATE "Invitation" SET "uses" = "uses" + 1 WHERE "id" = ${invite.id} AND "uses" < "maxUses" AND "revokedAt" IS NULL AND "expiresAt" > NOW()`;
  if (claimed === 0) redirect("/login?error=This+invitation+is+no+longer+available.");

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  if (invite.role === "ADMIN") {
    await prisma.user.create({ data: { email, passwordHash, role: "ADMIN" } });
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "CANDIDATE",
        candidate: { create: { fullName, email, targetRole: invite.targetRole } },
      },
      include: { candidate: true },
    });
    const candidateId = user.candidate!.id;
    if (invite.assignStandard || invite.technicalOnly) {
      await prisma.assignment.create({ data: { candidateId, technicalOnly: invite.technicalOnly } });
    }
    if (invite.groupId) {
      const group = await prisma.group.findUnique({ where: { id: invite.groupId } });
      if (group) await prisma.groupMember.create({ data: { groupId: group.id, candidateId } });
    }
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=Account+created.+Please+log+in.");
    throw error;
  }
  redirect(invite.role === "ADMIN" ? "/admin" : "/dashboard");
}
