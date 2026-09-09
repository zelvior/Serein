import { AIProvider, GenerateOptions, ModelInfo } from "../types";
import { OpenRouterProvider } from "./openrouter";

function loadKeyPool(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`OPENROUTER_API_KEY_${i}`];
    if (key) keys.push(key);
  }
  const single = process.env.OPENROUTER_API_KEY;
  if (single) keys.push(single);
  return keys;
}

const RETRYABLE = /_(401|403|429|500|502|503|504)$/;

export class OpenRouterPoolProvider implements AIProvider {
  id = "openrouter-pool";
  private keys: string[];
  private cursor = 0;

  constructor(keys: string[] = loadKeyPool()) {
    this.keys = keys;
  }

  get available(): boolean {
    return this.keys.length > 0;
  }

  private nextProvider(offset: number): OpenRouterProvider | null {
    if (this.keys.length === 0) return null;
    const idx = (this.cursor + offset) % this.keys.length;
    return new OpenRouterProvider(this.keys[idx]);
  }

  async generate(opts: GenerateOptions): Promise<string> {
    let lastErr: unknown;
    for (let i = 0; i < this.keys.length; i++) {
      const provider = this.nextProvider(i);
      if (!provider) break;
      try {
        const result = await provider.generate(opts);
        this.cursor = (this.cursor + i) % this.keys.length;
        return result;
      } catch (err) {
        lastErr = err;
        if (!(err instanceof Error) || !RETRYABLE.test(err.message)) throw err;
      }
    }
    throw lastErr ?? new Error("no_keys_available");
  }

  async *stream(opts: GenerateOptions) {
    let lastErr: unknown;
    for (let i = 0; i < this.keys.length; i++) {
      const provider = this.nextProvider(i);
      if (!provider) break;
      try {
        for await (const chunk of provider.stream(opts)) {
          yield chunk;
        }
        this.cursor = (this.cursor + i) % this.keys.length;
        return;
      } catch (err) {
        lastErr = err;
        if (!(err instanceof Error) || !RETRYABLE.test(err.message)) throw err;
        // try next key in pool
      }
    }
    throw lastErr ?? new Error("no_keys_available");
  }

  supports(): boolean {
    return this.available;
  }

  async getModels(): Promise<ModelInfo[]> {
    const provider = this.nextProvider(0);
    return provider ? provider.getModels() : [];
  }

  async validateCredentials(): Promise<boolean> {
    for (let i = 0; i < this.keys.length; i++) {
      const provider = this.nextProvider(i);
      if (provider && (await provider.validateCredentials().catch(() => false))) return true;
    }
    return false;
  }
}
