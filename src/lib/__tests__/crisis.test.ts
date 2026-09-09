import { detectCrisis } from "@/lib/safety/crisis";

describe("detectCrisis", () => {
  it("flags explicit suicidal statements", () => {
    expect(detectCrisis("I want to kill myself")).toBe(true);
    expect(detectCrisis("honestly I just want to die")).toBe(true);
    expect(detectCrisis("I've been thinking about self-harm")).toBe(true);
  });

  it("does not flag ordinary emotional statements", () => {
    expect(detectCrisis("I'm having a rough day")).toBe(false);
    expect(detectCrisis("work is killing me lol")).toBe(false);
    expect(detectCrisis("I feel a bit down today")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(detectCrisis("I WANT TO DIE")).toBe(true);
  });
});
