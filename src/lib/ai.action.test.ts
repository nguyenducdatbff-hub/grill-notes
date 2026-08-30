import { describe, expect, it } from "vitest";
import { buildActionPrompt } from "./ai.action";

describe("buildActionPrompt", () => {
  it("wraps text per action", () => {
    expect(buildActionPrompt("simplify", "foo bar")).toContain("foo bar");
    expect(buildActionPrompt("simplify", "foo bar")).toContain("shorter");
  });
});
