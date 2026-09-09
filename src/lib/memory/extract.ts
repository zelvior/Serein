import { AIProvider } from "@/lib/ai/types";
import { isStorable } from "@/lib/memory";

export interface ExtractedMemory {
  category: "interest" | "goal" | "relationship" | "communication" | "topic";
  content: string;
}

const EXTRACTION_SYSTEM_PROMPT = `
You extract durable, useful facts about the user from a single exchange, for a personal-companion app's long-term memory.
Only extract things that would still be true and useful weeks from now: interests, goals, important people/relationships, recurring topics, communication preferences.
Do NOT extract: one-off statements, medical/diagnostic claims, self-harm content, transient moods, anything already obvious from context.
Respond ONLY with JSON, no preamble, no markdown fences: {"memories":[{"category":"interest|goal|relationship|communication|topic","content":"short factual sentence"}]}
If nothing durable is worth remembering, respond {"memories":[]}.
`.trim();

export async function extractMemories(
  provider: AIProvider,
  model: string,
  userMessage: string,
  assistantMessage: string
): Promise<ExtractedMemory[]> {
  try {
    const raw = await provider.generate({
      model,
      maxTokens: 300,
      temperature: 0.2,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `User said: "${userMessage}"\nAssistant replied: "${assistantMessage}"`,
        },
      ],
    });

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const list: ExtractedMemory[] = Array.isArray(parsed.memories) ? parsed.memories : [];

    return list
      .filter((m) => m?.content && typeof m.content === "string" && m.content.length <= 300)
      .filter((m) => isStorable(m.content))
      .slice(0, 3);
  } catch {
    return [];
  }
}
