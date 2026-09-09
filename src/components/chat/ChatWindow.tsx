"use client";

import { useRef, useState, useEffect, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatSidebar } from "./ChatSidebar";
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
  conversationId?: string | null;
  scenarioId?: string;
  placeholder?: string;
  emptyLabel?: string;
  showSidebar?: boolean;
}

const tts = new BrowserTTSProvider();

export function ChatWindow({
  conversationId: initialConversationId = null,
  scenarioId,
  placeholder = "Say anything…",
  emptyLabel = "What's on your mind?",
  showSidebar = false,
}: ChatWindowProps) {
  const router = useRouter();
  const draftKey = `draft:${scenarioId ?? initialConversationId ?? "new"}`;
  const cacheKey = `cache:${scenarioId ?? initialConversationId ?? "new"}`;

  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load an existing conversation's messages from the server (source of truth),
  // falling back to the IndexedDB cache when offline or while it loads.
  useEffect(() => {
    let cancelled = false;

    getCachedMessages(cacheKey).then((cached) => {
      if (!cancelled && cached.length) setMessages(cached);
    });

    if (initialConversationId) {
      fetch(`/api/conversations/${initialConversationId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d?.messages) {
            setMessages(
              d.messages.map((m: { id: string; role: "user" | "assistant"; content: string }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))
            );
          }
        })
        .catch(() => {});
    }

    getDraft(draftKey).then((draft) => {
      if (!cancelled && draft?.text) setInput(draft.text);
    });

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
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
        body: JSON.stringify({ message: text, conversationId, scenarioId }),
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

      const newConversationId = res.headers.get("X-Conversation-Id");
      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
        setSidebarRefreshKey((k) => k + 1);
        if (!scenarioId) {
          router.replace(`/chat/${newConversationId}`, { scroll: false });
        }
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
    <div className="flex h-screen">
      {showSidebar && (
        <ChatSidebar
          activeConversationId={conversationId}
          refreshKey={sidebarRefreshKey}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <DoodleSwirl className="pointer-events-none absolute -left-6 top-16 h-24 w-24 text-[var(--text-secondary)] opacity-[0.07]" />
        <DoodleSparkle className="pointer-events-none absolute right-8 top-24 h-10 w-10 text-[var(--accent)] opacity-20" />

        <header className="relative z-10 flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {showSidebar && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversations"
                className="rounded-md p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:hidden"
              >
                <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
            <span className="font-display text-lg italic text-[var(--text-primary)]">Serein</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {!isOnline && (
              <span className="hidden rounded-full border border-[var(--border-solid)] px-3 py-1 text-xs text-[var(--text-secondary)] sm:inline">
                Offline
              </span>
            )}
            <ModelPicker />
            <button
              type="button"
              aria-pressed={autoplay}
              onClick={() => setAutoplay((v) => !v)}
              className={`hidden rounded-full border px-3 py-1 text-xs transition-colors sm:inline ${
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
          <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-3xl border border-[var(--border-solid)] bg-[var(--surface)] px-4 py-2.5">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Message Serein"
              disabled={streaming}
              rows={1}
              className="max-h-40 flex-1 resize-none bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              aria-label="Send message"
              className="mb-0.5 shrink-0 rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Send
            </button>
          </div>
          <p className="mx-auto mt-1.5 max-w-2xl text-center text-[11px] text-[var(--text-secondary)]">
            Enter to send · Shift+Enter for a new line
          </p>
        </form>
      </div>
    </div>
  );
}
