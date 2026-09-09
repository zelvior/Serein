import { isValidEmail, isValidPassword } from "@/lib/security/validation";

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

  it("rejects excessively long or non-string input", () => {
    expect(isValidPassword("a".repeat(201))).toBe(false);
    expect(isValidPassword(12345678)).toBe(false);
    expect(isValidPassword(null)).toBe(false);
  });
});
