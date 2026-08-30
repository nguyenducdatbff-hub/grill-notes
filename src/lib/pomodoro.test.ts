import { describe, expect, it } from "vitest";
import { fmt, presetSeconds } from "./pomodoro";

describe("pomodoro helpers", () => {
  it("formats mm:ss", () => expect(fmt(1500)).toBe("25:00"));
  it("presets", () => {
    expect(presetSeconds("pomodoro")).toBe(25 * 60);
    expect(presetSeconds("short")).toBe(5 * 60);
    expect(presetSeconds("long")).toBe(15 * 60);
  });
});
