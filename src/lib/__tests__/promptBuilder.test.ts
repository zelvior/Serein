import { buildSystemPrompt } from "@/lib/prompt/builder";
import { UserProfile } from "@/types/profile";

const baseProfile: UserProfile = {
  userId: "u1",
  communication: { responseLength: "short", tone: "casual", humor: "light", emojiLevel: "low" },
  support: { style: "listen_first", advicePreference: "when_useful" },
  social: { introversion: "introverted", goals: ["understand_myself"], struggles: ["overthinking"] },
  language: "english",
  tts: { enabled: false, speed: 1, autoplay: false },
  appearance: { theme: "dark" },
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("buildSystemPrompt", () => {
  it("includes safety rules regardless of profile", () => {
    const prompt = buildSystemPrompt(baseProfile);
    expect(prompt).toContain("SAFETY RULES");
    expect(prompt).toContain("Never diagnose");
  });

  it("reflects tone and response length preferences", () => {
    const prompt = buildSystemPrompt(baseProfile);
    expect(prompt).toContain("Tone: casual");
    expect(prompt).toContain("1-3 sentences");
  });

  it("includes goals and struggles when present", () => {
    const prompt = buildSystemPrompt(baseProfile);
    expect(prompt).toContain("understand_myself");
    expect(prompt).toContain("overthinking");
  });

  it("omits empty goal/struggle lines", () => {
    const profile = { ...baseProfile, social: { ...baseProfile.social, goals: [], struggles: [] } };
    const prompt = buildSystemPrompt(profile);
    expect(prompt).not.toContain("Goals:");
    expect(prompt).not.toContain("Current struggles:");
  });

  it("appends relevant memory when provided", () => {
    const prompt = buildSystemPrompt(baseProfile, [
      { id: "m1", userId: "u1", category: "interest", content: "likes hiking", createdAt: "", updatedAt: "", source: "explicit" },
    ]);
    expect(prompt).toContain("RELEVANT USER MEMORY");
    expect(prompt).toContain("likes hiking");
  });

  it("appends conversation context (e.g. crisis instructions) when provided", () => {
    const prompt = buildSystemPrompt(baseProfile, [], "CRISIS MODE ACTIVE");
    expect(prompt).toContain("CURRENT CONTEXT");
    expect(prompt).toContain("CRISIS MODE ACTIVE");
  });

  it("is deterministic for identical input", () => {
    const a = buildSystemPrompt(baseProfile);
    const b = buildSystemPrompt(baseProfile);
    expect(a).toBe(b);
  });
});
