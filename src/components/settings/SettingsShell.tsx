import Link from "next/link";
import { ReactNode } from "react";

const SECTIONS = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/ai", label: "AI" },
  { href: "/settings/memory", label: "Memory" },
  { href: "/settings/privacy", label: "Privacy" },
];

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12 sm:flex-row sm:gap-10">
      <nav className="mb-8 flex gap-2 overflow-x-auto sm:mb-0 sm:w-40 sm:flex-col sm:gap-1">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
