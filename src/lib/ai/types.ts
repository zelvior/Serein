export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  free: boolean;
}

export interface GenerateOptions {
  messages: ChatMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  id: string;
  generate(opts: GenerateOptions): Promise<string>;
  stream(opts: GenerateOptions): AsyncGenerable<string>;
  supports(model: string): boolean;
  getModels(): Promise<ModelInfo[]>;
  validateCredentials(): Promise<boolean>;
}

export type AsyncGenerable<T> = AsyncGenerator<T, void, unknown>;
