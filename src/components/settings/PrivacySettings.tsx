"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PrivacySettings() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    const res = await fetch("/api/settings/account");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serein-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/settings/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    if (res.ok) window.location.href = "/";
    else setDeleting(false);
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-[var(--text-primary)]">Privacy</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Your conversations are never sold or used for unrelated analytics.
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Export your data</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Download your profile, memory, and conversations as a file.
        </p>
        <Button variant="ghost" onClick={handleExport} className="mt-3">
          Export data
        </Button>
      </div>

      <div className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-sm font-medium text-red-400">Delete account</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Permanently deletes your profile, memory, conversations, and connected providers. This can&apos;t be undone.
        </p>
        {!confirming ? (
          <Button variant="ghost" onClick={() => setConfirming(true)} className="mt-3 border-red-400/40 text-red-400">
            Delete account
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-400 text-[var(--background)]">
              {deleting ? "Deleting…" : "Confirm delete"}
            </Button>
            <button
              onClick={() => setConfirming(false)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
