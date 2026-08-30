import { describe, expect, it } from "vitest";
import { isTheme, THEMES } from "./theme";

describe("theme", () => {
  it("defines supported themes", () => {
    expect(THEMES).toContain("light"); expect(THEMES).toContain("dark"); expect(THEMES).toContain("sepia"); expect(THEMES).toContain("night");
  });
  it("validates", () => {
    expect(isTheme("dark")).toBe(true); expect(isTheme("nope")).toBe(false);
  });
});
