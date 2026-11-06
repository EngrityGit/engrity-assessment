import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Engrity Assessments <assessments@engrity.com>";

export const emailEnabled = Boolean(resend);

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Branded wrapper: Engrity blue #0071fe, #1b1b1b text, #ecf0f8 page, #cee7ff accent, 20px card.
function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#ecf0f8;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1b1b1b">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #cee7ff">
    <div style="font-size:13px;font-weight:800;letter-spacing:.08em;color:#0071fe;margin-bottom:12px">ENGRITY</div>
    <h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
    <div style="font-size:15px;line-height:1.6">${bodyHtml}</div>
    ${cta ? `<p style="margin:24px 0 8px"><a href="${esc(cta.url)}" style="background:#0071fe;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:15px;display:inline-block">${esc(cta.label)}</a></p>
    <p style="font-size:12px;color:#6b7280;word-break:break-all">Or paste this link into your browser:<br>${esc(cta.url)}</p>` : ""}
  </div>
  <p style="text-align:center;font-size:11px;color:#6b7280;margin-top:16px">Engrity Group Inc · Edmonton, Alberta</p>
  </body></html>`;
}

// Non-blocking: a missing/failing email provider must never block a flow —
// the admin UI always shows the link so it can be shared manually.
async function send(to: string | string[], subject: string, text: string, html: string) {
  if (!resend) return false;
  try {
    await resend.emails.send({ from: FROM, to, subject, text, html });
    return true;
  } catch (err) {
    console.error("[email] send failed:", subject, err);
    return false;
  }
}

export function sendPasswordResetEmail(p: { to: string; resetUrl: string }) {
  return send(
    p.to,
    "Reset your Engrity password",
    `We received a request to reset your Engrity password.\n\nUse this link (valid 1 hour, single use):\n${p.resetUrl}\n\nIf you didn't request this, ignore this email.`,
    layout("Reset your password", "<p>We received a request to reset your Engrity password. This link is valid for 1 hour and can be used once.</p><p>If you didn't request it, you can safely ignore this email.</p>", { label: "Choose a new password", url: p.resetUrl })
  );
}

export function sendWelcomeEmail(p: { to: string; fullName: string; setupUrl: string }) {
  return send(
    p.to,
    "Set up your Engrity account",
    `Hi ${p.fullName},\n\nAn Engrity admin created an account for you. Set your password here (valid 7 days):\n${p.setupUrl}`,
    layout(`Welcome, ${p.fullName}`, "<p>An Engrity admin has set up an account for you. Set your password to get started — the link is valid for 7 days.</p>", { label: "Set my password", url: p.setupUrl })
  );
}

export function sendInvitationEmail(p: { to: string; fullName?: string | null; inviteUrl: string; note?: string | null; invitedBy?: string }) {
  const hi = p.fullName ? `Hi ${p.fullName},` : "Hi,";
  return send(
    p.to,
    "You're invited to Engrity Assessments",
    `${hi}\n\nYou've been invited to join the Engrity platform${p.invitedBy ? ` by ${p.invitedBy}` : ""}.${p.note ? `\n\n"${p.note}"` : ""}\n\nAccept your invitation:\n${p.inviteUrl}`,
    layout("You're invited to Engrity", `<p>${esc(hi)}</p><p>You've been invited to join the Engrity platform${p.invitedBy ? ` by ${esc(p.invitedBy)}` : ""} — assessments, AI interviews, training and compliance tools in one place.</p>${p.note ? `<p style="background:#ecf0f8;border-radius:15px;padding:12px 14px">${esc(p.note)}</p>` : ""}`, { label: "Accept invitation", url: p.inviteUrl })
  );
}

export function sendAccessRequestNotice(p: { to: string[]; fullName: string; email: string; adminUrl: string }) {
  if (p.to.length === 0) return Promise.resolve(false);
  return send(
    p.to,
    `Access request from ${p.fullName}`,
    `${p.fullName} (${p.email}) requested access to Engrity Assessments.\nReview: ${p.adminUrl}`,
    layout("New access request", `<p><strong>${esc(p.fullName)}</strong> (${esc(p.email)}) requested access.</p>`, { label: "Review request", url: p.adminUrl })
  );
}

export function sendInterviewAssignedEmail(p: { to: string; fullName: string; url: string; dueAt?: Date | null }) {
  return send(
    p.to,
    "Your Engrity AI interview is ready",
    `Hi ${p.fullName},\n\nAn AI voice interview has been assigned to you${p.dueAt ? ` (due ${p.dueAt.toLocaleDateString()})` : ""}.\nFind a quiet place, allow microphone access and open: ${p.url}`,
    layout("Your AI interview is ready", `<p>Hi ${esc(p.fullName)}, an AI voice interview has been assigned to you${p.dueAt ? ` (due ${esc(p.dueAt.toLocaleDateString())})` : ""}.</p><p>Find a quiet place, allow microphone access, and answer in your own words. It takes about 15–20 minutes.</p>`, { label: "Open interview", url: p.url })
  );
}
