const CRISIS_PATTERNS: RegExp[] = [
  /\bkill myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend my life\b/i,
  /\bwant to die\b/i,
  /\bdon'?t want to (be alive|live)\b/i,
  /\bself.?harm\b/i,
  /\b(cut|cutting) myself\b/i,
  /\bno reason to (live|go on)\b/i,
  /\bgoing to hurt (myself|someone)\b/i,
  /\bplan to kill\b/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

export const CRISIS_RESPONSE_INSTRUCTIONS = `
CRISIS MODE ACTIVE — this overrides all personality, tone, and humor settings above.
The user's message may indicate risk of self-harm, suicide, or danger to others.
- Respond calmly and directly, in plain warm language, not clinical.
- Acknowledge what they're feeling without minimizing it.
- Do not joke, use dark humor, or stay purely in a casual/playful tone.
- Gently but clearly encourage contacting a crisis line or emergency services, or a trusted person nearby, right now.
- Do not provide any instructions that could facilitate self-harm.
- Do not attempt to diagnose. Do not say you are all they need.
- Keep the response short and focused on immediate safety, not exploration.
`.trim();

export const CRISIS_RESOURCES = {
  us: "988 Suicide & Crisis Lifeline — call or text 988 (US)",
  intl: "findahelpline.com — helplines by country",
};
