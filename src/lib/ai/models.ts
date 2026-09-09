export interface SereinModel {
  alias: string; // shown to user
  id: string; // real underlying model id, never exposed to client
  description: string;
}

export const MODEL_REGISTRY: SereinModel[] = [
  { alias: "Serein Flow", id: "openrouter/free", description: "Balanced default — good for everyday conversation." },
  { alias: "Serein Breeze", id: "google/gemma-4-26b-a4b-it:free", description: "Light and fast." },
  { alias: "Serein Guard", id: "nvidia/nemotron-3.5-content-safety:free", description: "Extra careful with sensitive topics." },
  { alias: "Serein Horizon", id: "google/gemma-4-31b-it:free", description: "A bit more depth than Breeze." },
  { alias: "Serein Drift", id: "liquid/lfm-2.5-2.6b:free", description: "Compact and quick." },
  { alias: "Serein Focus", id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", description: "Reasons through more complex thoughts." },
  { alias: "Serein Lagoon", id: "poolside/laguna-xs-2.1:free", description: "Small and efficient." },
  { alias: "Serein Spark", id: "thinkingmachines/inkling-small:free", description: "Snappy short replies." },
  { alias: "Serein Cipher", id: "cohere/north-mini-code:free", description: "Sharper with structured or technical talk." },
  { alias: "Serein Meadow", id: "inclusionai/ling-3.0-flash-sante:free", description: "Gentle, wellness-leaning tone." },
  { alias: "Serein Ink", id: "thinkingmachines/inkling:free", description: "More expressive writing style." },
  { alias: "Serein Summit", id: "nvidia/nemotron-3-super-120b-a12b:free", description: "Our most capable option." },
  { alias: "Serein Ledger", id: "inclusionai/ling-3.0-flash-fin:free", description: "Precise and grounded." },
  { alias: "Serein Bolt", id: "nvidia/nemotron-3.5-lightning:free", description: "Very fast responses." },
  { alias: "Serein Bay", id: "poolside/laguna-s-2.1:free", description: "A step up from Lagoon." },
  { alias: "Serein Vast", id: "nvidia/nemotron-3-ultra-550b-a55b:free", description: "Maximum depth for hard conversations." },
];

const DEFAULT_MODEL = MODEL_REGISTRY[0];

export function resolveModelId(alias?: string): string {
  const found = MODEL_REGISTRY.find((m) => m.alias === alias);
  return (found ?? DEFAULT_MODEL).id;
}

export function publicModelList(): { alias: string; description: string }[] {
  return MODEL_REGISTRY.map(({ alias, description }) => ({ alias, description }));
}
