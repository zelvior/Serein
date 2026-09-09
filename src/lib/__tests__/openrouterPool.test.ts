import { OpenRouterPoolProvider } from "@/lib/ai/providers/openrouter-pool";

function mockFetchSequence(responses: Array<{ ok: boolean; status: number; body?: unknown }>) {
  let call = 0;
  global.fetch = jest.fn(async () => {
    const res = responses[Math.min(call, responses.length - 1)];
    call++;
    return {
      ok: res.ok,
      status: res.status,
      json: async () => res.body ?? {},
    } as Response;
  }) as unknown as typeof fetch;
}

describe("OpenRouterPoolProvider", () => {
  it("reports unavailable with an empty key pool", () => {
    const pool = new OpenRouterPoolProvider([]);
    expect(pool.available).toBe(false);
  });

  it("reports available with at least one key", () => {
    const pool = new OpenRouterPoolProvider(["key1"]);
    expect(pool.available).toBe(true);
  });

  it("falls back to the next key when the first is rate-limited", async () => {
    mockFetchSequence([
      { ok: false, status: 429 },
      { ok: true, status: 200, body: { choices: [{ message: { content: "hello" } }] } },
    ]);
    const pool = new OpenRouterPoolProvider(["bad-key", "good-key"]);
    const result = await pool.generate({ model: "m", messages: [{ role: "user", content: "hi" }] });
    expect(result).toBe("hello");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all keys", async () => {
    mockFetchSequence([{ ok: false, status: 401 }]);
    const pool = new OpenRouterPoolProvider(["k1", "k2", "k3"]);
    await expect(
      pool.generate({ model: "m", messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry on non-retryable errors", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("network_down");
    }) as unknown as typeof fetch;
    const pool = new OpenRouterPoolProvider(["k1", "k2"]);
    await expect(
      pool.generate({ model: "m", messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow("network_down");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
