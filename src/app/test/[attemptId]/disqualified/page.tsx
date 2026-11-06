import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";

export default function DisqualifiedPage() {
  return (
    <AuthCard title="Assessment closed" subtitle="This assessment was closed automatically after repeated rule violations (switching tabs, leaving full screen, copying/pasting or using outside help). Engrity has been notified.">
      <Link href="/dashboard" className="btn btn-primary w-full">Back to my dashboard</Link>
    </AuthCard>
  );
}
