import Link from "next/link";
import { SCENARIOS } from "@/lib/prompt/scenarios";

export default function PracticePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-16">
      <h1 className="font-display text-3xl italic text-[var(--text-primary)]">Practice</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Roleplay a real-world moment before you have it for real.
      </p>

      <ul className="mt-8 flex flex-col gap-2">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <Link
              href={`/practice/${s.id}`}
              className="block rounded-xl border border-[var(--border-solid)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
