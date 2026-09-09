import { UserProfile, MemoryItem } from "@/types/profile";
import { BASE_SYSTEM_PROMPT, SAFETY_RULES } from "./safety";

const LENGTH_MAP: Record<UserProfile["communication"]["responseLength"], string> = {
  short: "Keep replies short — 1-3 sentences unless the user asks for more.",
  normal: "Keep replies concise but complete, a short paragraph.",
  detailed: "Give thorough, detailed replies when useful.",
};

const HUMOR_MAP: Record<UserProfile["communication"]["humor"], string> = {
  none: "Avoid humor.",
  light: "Light humor is welcome occasionally.",
  playful: "Be playful and witty where appropriate.",
  chaotic: "Feel free to be silly and unpredictable in tone, while staying kind.",
};

const SUPPORT_MAP: Record<UserProfile["support"]["style"], string> = {
  listen_first: "Prioritize listening and reflecting before offering advice.",
  understand: "Focus on helping the user understand their own thoughts and feelings.",
  advice: "Offer practical advice when the user shares a problem.",
  both: "Balance listening with practical advice as appropriate.",
};

function formatMemory(memories: MemoryItem[]): string {
  if (!memories.length) return "";
  const lines = memories.map((m) => `- (${m.category}) ${m.content}`).join("\n");
  return `RELEVANT USER MEMORY:\n${lines}`;
}

export function buildSystemPrompt(
  profile: UserProfile,
  memories: MemoryItem[] = [],
  conversationContext = ""
): string {
  const parts = [
    BASE_SYSTEM_PROMPT,
    SAFETY_RULES,
    [
      "USER PREFERENCES:",
      `- Tone: ${profile.communication.tone}.`,
      `- ${LENGTH_MAP[profile.communication.responseLength]}`,
      `- ${HUMOR_MAP[profile.communication.humor]}`,
      `- Emoji use: ${profile.communication.emojiLevel}.`,
      `- ${SUPPORT_MAP[profile.support.style]}`,
      `- User is ${profile.social.introversion}.`,
      profile.social.goals.length ? `- Goals: ${profile.social.goals.join(", ")}.` : "",
      profile.social.struggles.length ? `- Current struggles: ${profile.social.struggles.join(", ")}.` : "",
      `- Respond in: ${profile.language}.`,
    ]
      .filter(Boolean)
      .join("\n"),
    formatMemory(memories),
    conversationContext ? `CURRENT CONTEXT:\n${conversationContext}` : "",
  ].filter(Boolean);

  return parts.join("\n\n");
}
