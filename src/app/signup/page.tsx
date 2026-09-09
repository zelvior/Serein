import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const dest = callbackUrl || "/onboarding";
  if (session?.user) redirect(dest);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-display text-3xl italic text-[var(--text-primary)]">Create your space</h1>
      <div className="mt-8 w-full max-w-xs">
        <SignupForm callbackUrl={dest} />
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link href={`/login?callbackUrl=${encodeURIComponent(dest)}`} className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
