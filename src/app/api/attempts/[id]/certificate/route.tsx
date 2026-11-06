import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getAttemptReportData } from "@/lib/report-data";
import { CertificateDocument } from "@/lib/pdf/CertificateDocument";

export const runtime = "nodejs";
export const maxDuration = 60;

// Full results PDF — admin only (contains scores, integrity log and AI notes).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const data = await getAttemptReportData(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(<CertificateDocument data={data} />);
  const safeName = data.attempt.candidate.fullName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="engrity-report-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
