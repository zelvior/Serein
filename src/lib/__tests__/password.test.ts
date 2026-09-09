import { hashPassword, verifyPassword, isValidEmail, isValidPassword } from "@/lib/security/password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", () => {
    const hash = hashPassword("correct-horse-battery-staple");
    expect(verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("correct-horse-battery-staple");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a different hash each time (unique salt)", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
    expect(verifyPassword("same-password", a)).toBe(true);
    expect(verifyPassword("same-password", b)).toBe(true);
  });

  it("rejects malformed stored hashes safely", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
    expect(verifyPassword("anything", "")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("requires at least 8 characters", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("longenough")).toBe(true);
  });

  it("rejects excessively long input", () => {
    expect(isValidPassword("a".repeat(201))).toBe(false);
  });
});
