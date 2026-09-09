"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ModelSwitcher } from "./ModelSwitcher";

interface ConnectedProvider {
  id: string;
  provider: string;
  baseUrl: string;
}

export function AISettings() {
  const [providers, setProviders] = useState<ConnectedProvider[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [name, setName] = useState("openai");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/providers")
      .then((r) => r.json())
      .then((d) => setProviders(d.providers ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: name, apiKey, baseUrl }),
    });
    if (res.ok) {
      setApiKey("");
      const list = await fetch("/api/settings/providers").then((r) => r.json());
      setProviders(list.providers ?? []);
      setStatus("idle");
    } else {
      setStatus("error");
    }
  }

  async function handleDisconnect(provider: string) {
    await fetch("/api/settings/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    setProviders((prev) => prev.filter((p) => p.provider !== provider));
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-[var(--text-primary)]">AI</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Bring your own API key for a provider Serein can use to generate responses.
      </p>

      <ModelSwitcher />

      <h2 className="mt-10 text-sm font-medium text-[var(--text-primary)]">Bring your own key</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Optional — connect your own provider for more control.
      </p>

      {loading ? (
        <div className="mt-6 h-16 animate-pulse rounded-xl bg-[var(--surface)]" aria-busy="true" />
      ) : providers.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {providers.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border-solid)] px-4 py-3"
            >
              <span className="text-sm text-[var(--text-primary)]">{p.provider}</span>
              <button
                onClick={() => handleDisconnect(p.provider)}
                className="text-xs text-[var(--text-secondary)] hover:text-red-400"
              >
                Disconnect
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-[var(--text-secondary)]">No providers connected yet.</p>
      )}

      <form onSubmit={handleConnect} className="mt-8 flex flex-col gap-3">
        <label className="text-sm text-[var(--text-secondary)]" htmlFor="provider-name">
          Provider name
        </label>
        <input
          id="provider-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        />
        <label className="text-sm text-[var(--text-secondary)]" htmlFor="base-url">
          Base URL
        </label>
        <input
          id="base-url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        />
        <label className="text-sm text-[var(--text-secondary)]" htmlFor="api-key">
          API key
        </label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-…"
          className="rounded-lg border border-[var(--border-solid)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        />
        {status === "error" && (
          <p role="alert" className="text-sm text-red-400">
            Couldn&apos;t verify that key. Check it and try again.
          </p>
        )}
        <Button type="submit" disabled={!apiKey || status === "saving"} className="self-start">
          {status === "saving" ? "Verifying…" : "Connect"}
        </Button>
      </form>
    </div>
  );
}
