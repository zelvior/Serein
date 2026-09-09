"use client";

import { useState, InputHTMLAttributes } from "react";

export function PasswordInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`w-full rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2.5 pr-11 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
            <path d="M6.6 6.7C4 8.3 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.9-1.3" />
            <path d="M17.9 17.9C20 16.3 22 12 22 12s-1.6-3.2-4.6-5.3" />
          </svg>
        )}
      </button>
    </div>
  );
}
