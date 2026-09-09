import { AIProvider, GenerateOptions } from "./types";

export interface RouterContext {
  userSelectedProvider?: AIProvider;
  userSelectedModel?: string;
  connectedOpenRouter?: AIProvider;
  freeProvider?: AIProvider;
  byokProvider?: AIProvider;
}

export class NoProviderAvailableError extends Error {
  constructor() {
    super("no_provider_available");
  }
}

export function resolveProvider(ctx: RouterContext): { provider: AIProvider; model: string } {
  if (ctx.userSelectedProvider && ctx.userSelectedModel) {
    return { provider: ctx.userSelectedProvider, model: ctx.userSelectedModel };
  }
  if (ctx.connectedOpenRouter) {
    return { provider: ctx.connectedOpenRouter, model: "openrouter/auto" };
  }
  if (ctx.freeProvider) {
    return { provider: ctx.freeProvider, model: "auto" };
  }
  if (ctx.byokProvider) {
    return { provider: ctx.byokProvider, model: "auto" };
  }
  throw new NoProviderAvailableError();
}

export async function routeGenerate(ctx: RouterContext, opts: Omit<GenerateOptions, "model">) {
  const { provider, model } = resolveProvider(ctx);
  return provider.generate({ ...opts, model });
}

export function routeStream(ctx: RouterContext, opts: Omit<GenerateOptions, "model">) {
  const { provider, model } = resolveProvider(ctx);
  return provider.stream({ ...opts, model });
}
