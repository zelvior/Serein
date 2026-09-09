import { signIn, auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

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
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
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
    </main>
  );
}
