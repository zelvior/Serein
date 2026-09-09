import { AIProvider, GenerateOptions, ModelInfo } from "../types";

export class OpenRouterProvider implements AIProvider {
  id = "openrouter";
  constructor(private apiKey: string) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async generate(opts: GenerateOptions): Promise<string> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        max_tokens: opts.maxTokens ?? 1000,
        temperature: opts.temperature ?? 0.8,
      }),
    });
    if (!res.ok) throw new Error(`openrouter_error_${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  async *stream(opts: GenerateOptions) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        max_tokens: opts.maxTokens ?? 1000,
        temperature: opts.temperature ?? 0.8,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) throw new Error(`openrouter_error_${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // skip malformed chunk
        }
      }
    }
  }

  supports(): boolean {
    return true;
  }

  async getModels(): Promise<ModelInfo[]> {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: this.headers(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((m: { id: string; name: string; context_length?: number; pricing?: { prompt?: string } }) => ({
      id: m.id,
      name: m.name,
      contextWindow: m.context_length ?? 4096,
      free: m.pricing?.prompt === "0",
    }));
  }

  async validateCredentials(): Promise<boolean> {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: this.headers(),
    });
    return res.ok;
  }
}
