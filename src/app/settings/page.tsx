import { SettingsShell } from "@/components/settings/SettingsShell";
import Link from "next/link";

export default function ProfileSettingsPage() {
  return (
    <SettingsShell>
      <h1 className="font-display text-2xl italic text-[var(--text-primary)]">Profile</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Your communication style, tone, and goals shape how Serein talks with you.
      </p>
      <Link
        href="/onboarding?retake=1"
        className="mt-6 inline-block rounded-full border border-[var(--border-solid)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]"
      >
        Retake preferences
      </Link>
    </SettingsShell>
  );
}
