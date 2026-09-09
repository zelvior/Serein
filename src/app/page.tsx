import Link from "next/link";
import Image from "next/image";
import {
  DoodleSwirl,
  DoodleSparkle,
  DoodleUnderline,
  DoodleCloud,
  DoodleStar,
  DoodleHeart,
} from "@/components/doodles/Doodles";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-[breathe_7s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
      />

      {/* hand-drawn doodles scattered around the hero, faint and decorative */}
      <DoodleSwirl className="pointer-events-none absolute left-[8%] top-[18%] h-16 w-16 text-[var(--accent)] opacity-20 sm:h-20 sm:w-20" />
      <DoodleSparkle className="pointer-events-none absolute right-[12%] top-[14%] h-8 w-8 text-[var(--accent)] opacity-40" />
      <DoodleStar className="pointer-events-none absolute left-[14%] bottom-[22%] h-10 w-10 text-[var(--text-secondary)] opacity-20" />
      <DoodleCloud className="pointer-events-none absolute right-[8%] bottom-[26%] h-14 w-14 text-[var(--text-secondary)] opacity-[0.15] sm:h-20 sm:w-20" />
      <DoodleHeart className="pointer-events-none absolute left-[6%] top-[52%] h-8 w-8 text-[var(--accent)] opacity-[0.12]" />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <Image src="/logo.png" alt="Serein" width={72} height={72} className="mb-6 rounded-2xl" priority />

        <span className="mb-6 text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
          A quiet place to talk
        </span>

        <h1 className="relative font-display text-5xl italic leading-[1.1] text-[var(--text-primary)] sm:text-6xl">
          Serein
          <DoodleUnderline className="absolute -bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 text-[var(--accent)] opacity-60" />
        </h1>

        <p className="mt-6 text-lg text-[var(--text-secondary)]">
          Talk. Reflect. Connect.
        </p>

        <p className="mt-6 max-w-sm text-balance text-sm leading-relaxed text-[var(--text-secondary)]">
          Serein is a private companion configured around how you actually communicate — here to help you
          understand yourself and show up better in your real relationships, not replace them.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login?callbackUrl=/onboarding"
            className="rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Begin
          </Link>
          <Link
            href="/login?callbackUrl=/home"
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
