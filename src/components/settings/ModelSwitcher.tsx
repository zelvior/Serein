"use client";

import { useState, useEffect } from "react";

interface ModelOption {
  alias: string;
  description: string;
}

export function ModelSwitcher() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/models")
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models ?? []);
        setSelected(d.selected ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(alias: string) {
    setSelected(alias);
    setSaving(true);
    await fetch("/api/settings/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    setSaving(false);
  }

  if (loading) {
    return <div className="mt-6 h-24 animate-pulse rounded-xl bg-[var(--surface)]" aria-busy="true" />;
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-[var(--text-primary)]">Model</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Switch which Serein model responds to you. Free options, no key required.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Model selection">
        {models.map((m) => (
          <button
            key={m.alias}
            type="button"
            role="radio"
            aria-checked={selected === m.alias}
            onClick={() => handleSelect(m.alias)}
            disabled={saving}
            className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              selected === m.alias
                ? "border-[var(--accent)] bg-[var(--surface)]"
                : "border-[var(--border-solid)] hover:bg-[var(--surface)]"
            }`}
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">{m.alias}</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
