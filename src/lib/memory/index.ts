import { MemoryItem } from "@/types/profile";

const SENSITIVE_PATTERNS = [/diagnos/i, /suicid/i, /self.?harm/i, /medical condition/i];

export function isStorable(content: string): boolean {
  return !SENSITIVE_PATTERNS.some((p) => p.test(content));
}

export function selectRelevantMemories(
  all: MemoryItem[],
  conversationText: string,
  limit = 8
): MemoryItem[] {
  const words = new Set(
    conversationText
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );
  const scored = all.map((m) => {
    const mWords = m.content.toLowerCase().split(/\W+/);
    const score = mWords.filter((w) => words.has(w)).length;
    return { m, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((s) => s.score > 0 || all.length <= limit)
    .map((s) => s.m);
}
