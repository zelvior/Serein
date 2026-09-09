"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoodleSquiggle } from "@/components/doodles/Doodles";

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  activeConversationId: string | null;
  refreshKey: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ activeConversationId, refreshKey, isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (activeConversationId === id) {
      router.push("/chat");
    }
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden
          className="fixed inset-0 z-20 bg-black/40 sm:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background)] transition-transform sm:static sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-display text-base italic text-[var(--text-primary)]">Chats</span>
          <DoodleSquiggle className="h-2.5 w-14 text-[var(--accent)] opacity-50" />
        </div>

        <Link
          href="/chat"
          onClick={onClose}
          className="mx-4 mb-3 rounded-full border border-[var(--border-solid)] px-4 py-2 text-center text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)]"
        >
          + New chat
        </Link>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="space-y-2 px-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--surface)]" aria-busy="true" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">No conversations yet.</p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/chat/${c.id}`}
                    onClick={onClose}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      activeConversationId === c.id
                        ? "bg-[var(--surface)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="truncate">{c.title || "New chat"}</span>
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      aria-label={`Delete "${c.title}"`}
                      className="ml-2 shrink-0 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
