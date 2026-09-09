"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { BrowserTTSProvider } from "@/lib/tts/providers/browser";
import { DoodleSparkle, DoodleSwirl } from "@/components/doodles/Doodles";
import { ModelPicker } from "./ModelPicker";
import Image from "next/image";
import { saveDraft, getDraft, clearDraft, cacheMessages, getCachedMessages } from "@/lib/db/indexeddb";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  scenarioId?: string;
  placeholder?: string;
  emptyLabel?: string;
}

const tts = new BrowserTTSProvider();

export function ChatWindow({ scenarioId, placeholder = "Say anything…", emptyLabel = "What's on your mind?" }: ChatWindowProps) {
  const draftKey = `draft:${scenarioId ?? "default"}`;
  const cacheKey = `cache:${scenarioId ?? "default"}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const bottomRef = useRef<HTMLDivElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore cached conversation + unsent draft on mount (offline-friendly).
  useEffect(() => {
    getCachedMessages(cacheKey).then((cached) => {
      if (cached.length) setMessages(cached);
    });
    getDraft(draftKey).then((draft) => {
      if (draft?.text) setInput(draft.text);
    });

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cache messages after every change so a refresh or lost connection never loses history.
  useEffect(() => {
    if (messages.length > 0) cacheMessages(cacheKey, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function handleInputChange(value: string) {
    setInput(value);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (value.trim()) saveDraft(draftKey, value);
      else clearDraft(draftKey);
    }, 400);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    if (!navigator.onLine) {
      setError("You're offline. Your message is saved as a draft — it'll be here when you're back.");
      return;
    }

    setError(null);
    setInput("");
    clearDraft(draftKey);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, scenarioId }),
      });

      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=/chat";
        return;
      }
      if (res.status === 429) {
        throw new Error("rate_limited");
      }
      if (res.status === 503) {
        throw new Error("no_provider");
      }
      if (!res.ok || !res.body) {
        throw new Error("request_failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      }
      if (autoplay && acc) {
        tts.speak({ text: acc, speed: 1 });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message === "rate_limited") {
        setError("You've hit today's message limit. Try again tomorrow.");
      } else if (message === "no_provider") {
        setError("No AI provider is configured right now. Check Settings → AI.");
      } else {
        setError("Serein couldn't respond right now. Check your connection and try again.");
      }
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      // Restore the draft so an interrupted send is never silently lost.
      saveDraft(draftKey, text);
      setInput(text);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <DoodleSwirl className="pointer-events-none absolute -left-6 top-16 h-24 w-24 text-[var(--text-secondary)] opacity-[0.07]" />
      <DoodleSparkle className="pointer-events-none absolute right-8 top-24 h-10 w-10 text-[var(--accent)] opacity-20" />

      <header className="relative z-10 flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
          <span className="font-display text-lg italic text-[var(--text-primary)]">Serein</span>
        </div>
        <div className="flex items-center gap-4">
          {!isOnline && (
            <span className="rounded-full border border-[var(--border-solid)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              Offline
            </span>
          )}
          <ModelPicker />
          <button
            type="button"
            aria-pressed={autoplay}
            onClick={() => setAutoplay((v) => !v)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              autoplay
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border-solid)] text-[var(--text-secondary)]"
            }`}
          >
            {autoplay ? "Voice on" : "Voice off"}
          </button>
          <a href="/settings" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Settings
          </a>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
              <DoodleSparkle className="mb-4 h-8 w-8 text-[var(--accent)] opacity-70" />
              <p className="font-display text-2xl italic text-[var(--text-secondary)]">
                {emptyLabel}
              </p>
            </div>
          )}
          {messages.map((m) =>
            m.role === "assistant" && m.content === "" && streaming ? (
              <TypingIndicator key={m.id} />
            ) : (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            )
          )}
          {error && (
            <p role="alert" className="text-center text-sm text-red-400">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="relative z-10 border-t border-[var(--border)] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--border-solid)] bg-[var(--surface)] px-4 py-2">
          <input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            aria-label="Message Serein"
            disabled={streaming}
            className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            aria-label="Send message"
            className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
