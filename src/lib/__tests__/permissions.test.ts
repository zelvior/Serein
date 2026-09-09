import { isOwner } from "@/lib/security/permissions";
import { validateMessage } from "@/lib/security/rateLimit";

describe("isOwner", () => {
  it("allows access when the resource belongs to the requesting user", () => {
    expect(isOwner("user-1", "user-1")).toBe(true);
  });

  it("denies access when the resource belongs to someone else", () => {
    expect(isOwner("user-1", "user-2")).toBe(false);
  });

  it("denies access when the resource has no owner set", () => {
    expect(isOwner(undefined, "user-1")).toBe(false);
  });
});

describe("validateMessage", () => {
  it("accepts a normal message", () => {
    expect(validateMessage("hello there")).toBe(true);
  });

  it("rejects empty or non-string input", () => {
    expect(validateMessage("")).toBe(false);
    expect(validateMessage(null)).toBe(false);
    expect(validateMessage(42)).toBe(false);
  });

  it("rejects messages over the length limit", () => {
    expect(validateMessage("a".repeat(4001))).toBe(false);
    expect(validateMessage("a".repeat(4000))).toBe(true);
  });
});
