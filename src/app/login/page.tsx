import { signIn } from "@/lib/auth/config";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-display text-3xl italic text-[var(--text-primary)]">Welcome back</h1>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/chat" });
          }}
        >
          <button className="w-full rounded-full border border-[var(--border-solid)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]">
            Continue with Google
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/chat" });
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
