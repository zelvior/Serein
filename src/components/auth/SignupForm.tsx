"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error === "email_taken") setError("An account with that email already exists.");
      else if (data.error === "weak_password") setError("Password must be at least 8 characters.");
      else if (data.error === "invalid_email") setError("Enter a valid email address.");
      else setError("Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      setError("Account created — please sign in.");
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-xs text-[var(--text-secondary)]" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      />
      <label className="text-xs text-[var(--text-secondary)]" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      />
      <label className="text-xs text-[var(--text-secondary)]" htmlFor="password">
        Password
      </label>
      <PasswordInput
        id="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="text-xs text-[var(--text-secondary)]">At least 8 characters.</p>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
