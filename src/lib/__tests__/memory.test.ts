import { selectRelevantMemories, isStorable } from "@/lib/memory";
import { MemoryItem } from "@/types/profile";

function mem(id: string, content: string): MemoryItem {
  return { id, userId: "u1", category: "interest", content, createdAt: "", updatedAt: "", source: "explicit" };
}

describe("selectRelevantMemories", () => {
  it("prioritizes memories matching conversation words", () => {
    const memories = [mem("1", "enjoys hiking and mountains"), mem("2", "works as a nurse")];
    const result = selectRelevantMemories(memories, "I went hiking in the mountains today", 5);
    expect(result[0].id).toBe("1");
  });

  it("falls back to all memories when list is small and no match", () => {
    const memories = [mem("1", "likes jazz music")];
    const result = selectRelevantMemories(memories, "completely unrelated topic here", 5);
    expect(result.length).toBe(1);
  });

  it("respects the limit", () => {
    const memories = Array.from({ length: 10 }, (_, i) => mem(String(i), `topic${i} about hiking`));
    const result = selectRelevantMemories(memories, "hiking", 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});

describe("isStorable", () => {
  it("rejects sensitive diagnostic/self-harm content", () => {
    expect(isStorable("user mentioned a diagnosis of depression")).toBe(false);
    expect(isStorable("expressed suicidal thoughts")).toBe(false);
  });

  it("allows ordinary preference content", () => {
    expect(isStorable("prefers short responses and casual tone")).toBe(true);
  });
});
