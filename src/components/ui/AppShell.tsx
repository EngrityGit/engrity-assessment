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
  width = "max-w-7xl", // bumped from max-w-6xl
  assistant = true,
}: {
  children: React.ReactNode;
  width?: string;
  assistant?: boolean;
}) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;
  const nav = role === "ADMIN" ? ADMIN_NAV : CANDIDATE_NAV;

  const userInitial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/40">
      <header className="sticky top-0 z-40 border-b border-accent/60 bg-white/90 backdrop-blur-md shadow-xs">
        <div className={`mx-auto flex ${width} items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2.5`}>
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href={role === "ADMIN" ? "/admin" : "/dashboard"}
              className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
            >
              <Image
                src="/engrity-logo.png"
                alt="Engrity"
                width={38}
                height={38}
                className="rounded-[10px]"
                priority
              />
            </Link>
            <NavLinks links={nav} />
          </div>

          {/* User Status & Actions */}
          <div className="flex items-center gap-3">
            {role === "ADMIN" && (
              <span className="badge badge-blue hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider">
                Admin
              </span>
            )}

            {user && (
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {userInitial}
                </div>
                <div className="text-left text-xs leading-tight">
                  <p className="max-w-32.5] truncate font-medium text-ink">
                    {user.name || user.email}
                  </p>
                  {user.name && user.email && (
                    <p className="max-w-32.5 truncate text-[11px] text-ink/50">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="hidden h-5 w-px bg-ink/10 sm:block" />

            <form action={logoutAction}>
              <button
                type="submit"
                className="btn btn-ghost btn-sm text-ink/70 hover:text-ink transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`mx-auto w-full flex-1 ${width} px-4 sm:px-6 lg:px-8 py-8 anim-fade-in`}>
        {children}
      </main>

      {assistant && session && <AssistantWidget role={session.user.role} />}
    </div>
  );
}