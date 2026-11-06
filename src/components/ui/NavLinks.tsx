"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
      {links.map((l) => {
        const active =
          pathname === l.href ||
          (l.href !== "/dashboard" && l.href !== "/admin" && l.href !== "/learn" && pathname.startsWith(l.href)) ||
          (l.href === "/learn" && pathname.startsWith("/learn") && !pathname.startsWith("/learn/games"));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-[12px] px-3 py-1.5 text-sm font-semibold transition ${
              active ? "bg-accent text-brand-dark" : "text-ink/70 hover:bg-surface"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
