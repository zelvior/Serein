"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { BrowserTTSProvider } from "@/lib/tts/providers/browser";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setInput("");
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
    } catch {
      setError("Serein couldn't respond right now. Check your connection and try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <span className="font-display text-lg italic text-[var(--text-primary)]">Serein</span>
        <div className="flex items-center gap-4">
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

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
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

      <form onSubmit={sendMessage} className="border-t border-[var(--border)] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--border-solid)] bg-[var(--surface)] px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
