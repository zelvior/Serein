export type ResponseLength = "short" | "normal" | "detailed";
export type Tone = "casual" | "calm" | "playful" | "direct" | "supportive";
export type HumorLevel = "none" | "light" | "playful" | "chaotic";
export type SupportStyle = "listen_first" | "understand" | "advice" | "both";
export type Introversion = "introverted" | "balanced" | "extroverted" | "unsure";
export type EmojiLevel = "none" | "low" | "medium" | "high";
export type Theme = "dark" | "light" | "system";

export interface UserProfile {
  userId: string;
  communication: {
    responseLength: ResponseLength;
    tone: Tone;
    humor: HumorLevel;
    emojiLevel: EmojiLevel;
  };
  support: {
    style: SupportStyle;
    advicePreference: "always" | "when_useful" | "rarely";
  };
  social: {
    introversion: Introversion;
    goals: string[];
    struggles: string[];
  };
  language: string;
  tts: {
    enabled: boolean;
    voice?: string;
    speed: number;
    autoplay: boolean;
  };
  appearance: {
    theme: Theme;
    accent?: string;
  };
  preferredModelAlias?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryItem {
  id: string;
  userId: string;
  category: "preference" | "interest" | "goal" | "relationship" | "communication" | "topic";
  content: string;
  createdAt: string;
  updatedAt: string;
  source: "explicit" | "inferred";
}
