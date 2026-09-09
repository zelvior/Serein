"use client";

import { useState, useEffect } from "react";

interface MemoryItem {
  id: string;
  content: string;
  category: string;
}

export function MemorySettings() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((d) => setMemories(d.memories ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    await fetch("/api/memory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-[var(--text-primary)]">Memory</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        What Serein remembers about you. Delete anything you don&apos;t want kept.
      </p>

      {loading ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--surface)]" aria-busy="true" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div role="status" className="mt-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Nothing saved yet. Serein remembers things naturally as you talk.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {memories.map((m) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-solid)] px-4 py-3"
            >
              <div>
                <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  {m.category}
                </span>
                <p className="mt-1 text-sm text-[var(--text-primary)]">{m.content}</p>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                aria-label={`Delete memory: ${m.content}`}
                className="shrink-0 text-xs text-[var(--text-secondary)] hover:text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
