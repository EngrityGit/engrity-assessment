import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";

export default function ExpiredPage() {
  return (
    <AuthCard title="Time's up" subtitle="The time limit for this round passed before it was submitted, so the assessment was closed. Please contact Engrity if you believe this is a mistake.">
      <Link href="/dashboard" className="btn btn-primary w-full">Back to my dashboard</Link>
    </AuthCard>
  );
}
