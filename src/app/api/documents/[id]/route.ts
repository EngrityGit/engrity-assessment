import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Every download is authorised here: the owner, any admin when the owner
// shared it "with Engrity admins", or a user it was explicitly shared with.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id }, include: { shares: { select: { userId: true } } } });
  const allowed =
    doc &&
    (doc.ownerId === session.user.id ||
      (session.user.role === "ADMIN" && doc.sharedWithAdmins) ||
      doc.shares.some((s) => s.userId === session.user.id));
  if (!doc || !allowed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const inline = doc.mimeType === "application/pdf" || doc.mimeType.startsWith("image/");
  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${doc.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(doc.size),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cache-Control": "private, no-store",
    },
  });
}
