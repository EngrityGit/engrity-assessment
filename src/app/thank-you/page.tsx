import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";

export default function ThankYouPage() {
  return (
    <AuthCard title="Assessment submitted" subtitle="Thank you — your responses have been recorded and will be reviewed by Engrity. You don't need to do anything else.">
      <div className="mb-5 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-brand anim-pop">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </div>
      </div>
      <Link href="/dashboard" className="btn btn-primary w-full">Back to my dashboard</Link>
    </AuthCard>
  );
}
