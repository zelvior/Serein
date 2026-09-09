import { resolveModelId, publicModelList, MODEL_REGISTRY } from "@/lib/ai/models";

describe("model registry", () => {
  it("never exposes real model ids in the public list", () => {
    const list = publicModelList();
    const realIds = MODEL_REGISTRY.map((m) => m.id);
    const serialized = JSON.stringify(list);
    realIds.forEach((id) => {
      expect(serialized).not.toContain(id);
    });
  });

  it("resolves a known alias to its real model id", () => {
    const target = MODEL_REGISTRY[3];
    expect(resolveModelId(target.alias)).toBe(target.id);
  });

  it("falls back to the default model for unknown or missing alias", () => {
    expect(resolveModelId("not-a-real-alias")).toBe(MODEL_REGISTRY[0].id);
    expect(resolveModelId(undefined)).toBe(MODEL_REGISTRY[0].id);
  });

  it("has unique aliases", () => {
    const aliases = MODEL_REGISTRY.map((m) => m.alias);
    expect(new Set(aliases).size).toBe(aliases.length);
  });
});
