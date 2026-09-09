import { signIn, auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CredentialsForm } from "@/components/auth/CredentialsForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const dest = callbackUrl || "/home";
  if (session?.user) redirect(dest);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-display text-3xl italic text-[var(--text-primary)]">Welcome back</h1>

      <div className="mt-8 w-full max-w-xs">
        <CredentialsForm callbackUrl={dest} />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-secondary)]">or</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: dest });
            }}
          >
            <button className="w-full rounded-full border border-[var(--border-solid)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]">
              Continue with Google
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: dest });
            }}
          >
            <button className="w-full rounded-full border border-[var(--border-solid)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]">
              Continue with GitHub
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          New here?{" "}
          <Link href={`/signup?callbackUrl=${encodeURIComponent(dest)}`} className="text-[var(--accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
