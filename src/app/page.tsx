import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-[breathe_7s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <span className="mb-6 text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
          A quiet place to talk
        </span>

        <h1 className="font-display text-5xl italic leading-[1.1] text-[var(--text-primary)] sm:text-6xl">
          Serein
        </h1>

        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          Talk. Reflect. Connect.
        </p>

        <p className="mt-6 max-w-sm text-balance text-sm leading-relaxed text-[var(--text-secondary)]">
          Serein is a private companion configured around how you actually communicate — here to help you
          understand yourself and show up better in your real relationships, not replace them.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/onboarding"
            className="rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Begin
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[var(--border-solid)] px-7 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            I already have an account
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-16 max-w-xs text-center text-xs text-[var(--text-secondary)]">
        Not a therapist. Not a replacement for people who care about you. Just somewhere to start.
      </p>
    </main>
  );
}
