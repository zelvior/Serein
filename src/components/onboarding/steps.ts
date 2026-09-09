export interface OnboardingChoice {
  key: string;
  label: string;
}

export interface OnboardingStep {
  id: string;
  question: string;
  multi?: boolean;
  choices: OnboardingChoice[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "introversion",
    question: "How would you describe yourself?",
    choices: [
      { key: "introverted", label: "Introverted" },
      { key: "balanced", label: "Balanced" },
      { key: "extroverted", label: "Extroverted" },
      { key: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "responseLength",
    question: "How much do you want Serein to say?",
    choices: [
      { key: "short", label: "Short and simple" },
      { key: "normal", label: "Normal" },
      { key: "detailed", label: "Detailed" },
    ],
  },
  {
    id: "tone",
    question: "What conversation style feels right?",
    choices: [
      { key: "casual", label: "Casual" },
      { key: "calm", label: "Calm" },
      { key: "playful", label: "Playful" },
      { key: "direct", label: "Direct" },
      { key: "supportive", label: "Supportive" },
    ],
  },
  {
    id: "supportStyle",
    question: "When you share something, what do you usually want?",
    choices: [
      { key: "listen_first", label: "Just listen" },
      { key: "understand", label: "Help me understand it" },
      { key: "advice", label: "Give advice" },
      { key: "both", label: "Both listening and advice" },
    ],
  },
  {
    id: "humor",
    question: "How much humor do you like?",
    choices: [
      { key: "none", label: "None" },
      { key: "light", label: "Light" },
      { key: "playful", label: "Playful" },
      { key: "chaotic", label: "Chaotic" },
    ],
  },
  {
    id: "struggles",
    question: "What brings you here? (pick any)",
    multi: true,
    choices: [
      { key: "making_friends", label: "Making friends" },
      { key: "starting_conversations", label: "Starting conversations" },
      { key: "keeping_conversations_going", label: "Keeping conversations going" },
      { key: "expressing_emotions", label: "Expressing emotions" },
      { key: "overthinking", label: "Overthinking" },
      { key: "confidence", label: "Confidence" },
      { key: "loneliness", label: "Loneliness" },
      { key: "understanding_feelings", label: "Understanding what I feel" },
      { key: "conflict_with_friends", label: "Conflict with friends" },
    ],
  },
  {
    id: "goals",
    question: "What would you like to work toward?",
    multi: true,
    choices: [
      { key: "meaningful_friendships", label: "Make meaningful friendships" },
      { key: "better_conversations", label: "Become better at conversations" },
      { key: "express_myself", label: "Express myself better" },
      { key: "understand_myself", label: "Understand myself" },
      { key: "social_confidence", label: "Become more socially confident" },
      { key: "somewhere_to_talk", label: "Have somewhere to talk" },
    ],
  },
  {
    id: "language",
    question: "What language should Serein speak?",
    choices: [
      { key: "english", label: "English" },
      { key: "urdu", label: "Urdu" },
      { key: "hinglish", label: "Hinglish" },
    ],
  },
];
