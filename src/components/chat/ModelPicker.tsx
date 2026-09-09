"use client";

import { useState, useEffect, useRef } from "react";

interface ModelOption {
  alias: string;
  description: string;
}

export function ModelPicker() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings/models")
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models ?? []);
        setSelected(d.selected ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(alias: string) {
    setSelected(alias);
    setOpen(false);
    setSaving(true);
    await fetch("/api/settings/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    setSaving(false);
  }

  if (!selected) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border-solid)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
      >
        {selected}
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border-solid)] bg-[var(--surface)] py-1 shadow-lg"
        >
          {models.map((m) => (
            <button
              key={m.alias}
              type="button"
              role="option"
              aria-selected={selected === m.alias}
              onClick={() => handleSelect(m.alias)}
              className={`block w-full px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-secondary)] ${
                selected === m.alias ? "bg-[var(--surface-secondary)]" : ""
              }`}
            >
              <p className="text-sm text-[var(--text-primary)]">{m.alias}</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{m.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
