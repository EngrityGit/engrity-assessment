import Image from "next/image";

export default function AuthCard({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent blur-3xl anim-float" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-brand/15 blur-3xl anim-float" />
      <div className={`card relative w-full ${wide ? "max-w-lg" : "max-w-md"} p-8 anim-fade-up`}>
        <Image src="/engrity-logo.png" alt="Engrity" width={44} height={44} className="mb-5 rounded-[12px]" />
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mb-6 mt-1 text-sm text-ink/70">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}

export function ErrorNote({ error }: { error?: string }) {
  if (!error) return null;
  return <div className="alert alert-error mb-4 anim-shake">{error}</div>;
}
