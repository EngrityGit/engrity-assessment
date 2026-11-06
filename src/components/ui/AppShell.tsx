import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import AssistantWidget from "@/components/AssistantWidget";
import NavLinks from "@/components/ui/NavLinks";

const CANDIDATE_NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/learn/games", label: "Games" },
  { href: "/interview", label: "Interviews" },
  { href: "/credentials", label: "Credentials" },
  { href: "/documents", label: "Documents" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/invitations", label: "Invitations" },
  { href: "/admin/interviews", label: "Interviews" },
  { href: "/admin/groups", label: "Groups" },
  { href: "/admin/credentials", label: "Compliance" },
  { href: "/admin/documents", label: "Documents" },
];

export default async function AppShell({
  children,
  width = "max-w-6xl",
  assistant = true,
}: {
  children: React.ReactNode;
  width?: string;
  assistant?: boolean;
}) {
  const session = await auth();
  const role = session?.user.role;
  const nav = role === "ADMIN" ? ADMIN_NAV : CANDIDATE_NAV;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-accent bg-white/85 backdrop-blur">
        <div className={`mx-auto flex ${width} items-center gap-4 px-4 py-3`}>
          <Link href={role === "ADMIN" ? "/admin" : "/dashboard"} className="flex items-center gap-2.5">
            <Image src="/engrity-logo.png" alt="Engrity" width={34} height={34} className="rounded-[10px]" />
            <span className="hidden text-sm font-extrabold tracking-tight sm:block">Engrity</span>
          </Link>
          <NavLinks links={nav} />
          <div className="ml-auto flex items-center gap-2">
            {role === "ADMIN" && <span className="badge badge-blue hidden sm:inline-flex">Admin</span>}
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className={`mx-auto ${width} px-4 py-8 anim-fade-in`}>{children}</main>
      {assistant && session && <AssistantWidget role={session.user.role} />}
    </div>
  );
}
