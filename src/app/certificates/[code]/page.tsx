import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: { candidate: true, attempt: true },
  });
  if (!certificate) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg p-10 text-center anim-fade-up">
        <Image src="/engrity-logo.png" alt="Engrity" width={52} height={52} className="mx-auto mb-6 rounded-[14px]" />
        <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-brand">CERTIFICATE OF COMPLETION</p>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight">{certificate.candidate.fullName}</h1>
        <p className="mb-6 text-ink/80">
          successfully completed the <strong>Engrity Candidate Assessment</strong> on{" "}
          {certificate.attempt.submittedAt?.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.
        </p>
        <div className="card-soft p-3 text-xs text-ink/60">
          Certificate ID: {certificate.id}
          <br />
          Issued {certificate.issuedAt.toLocaleDateString()}
        </div>
        <p className="mt-6 text-xs text-ink/50">
          This page confirms completion only. Detailed results are shared directly with Engrity and are not disclosed here.
        </p>
      </div>
    </div>
  );
}
