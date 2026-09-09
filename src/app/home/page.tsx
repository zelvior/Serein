import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { DoodleCloud, DoodleSparkle, DoodleArrow } from "@/components/doodles/Doodles";

const ITEMS = [
  { href: "/chat", label: "Continue talking", desc: "Pick up where you left off." },
  { href: "/practice", label: "Practice a conversation", desc: "Roleplay a real moment before it happens." },
  { href: "/settings/memory", label: "Memory", desc: "See what Serein remembers." },
  { href: "/settings", label: "Personalization", desc: "Tone, length, language, and more." },
];

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/home");

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center overflow-hidden px-6 py-16">
      <DoodleCloud className="pointer-events-none absolute -right-6 top-12 h-16 w-16 text-[var(--text-secondary)] opacity-[0.12]" />
      <DoodleSparkle className="pointer-events-none absolute left-0 bottom-24 h-7 w-7 text-[var(--accent)] opacity-25" />

      <h1 className="font-display text-3xl italic text-[var(--text-primary)]">Welcome back</h1>
      <div className="mt-8 flex flex-col gap-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-xl border border-[var(--border-solid)] px-5 py-4 transition-colors hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{item.desc}</p>
            </div>
            <DoodleArrow className="h-5 w-8 shrink-0 text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-60" />
          </Link>
        ))}
      </div>
    </main>
  );
}
