import { describe, expect, it } from "vitest";
import { buildDigestPrompt, todayStr } from "./digest";

describe("digest", () => {
  it("builds a prompt from input", () => {
    const input = { dateStr: "2026-08-30", notes: [{ title: "A" }], tasks: [], focusSecs: 1500, focusSessions: 1 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = buildDigestPrompt(input as any);
    expect(p).toContain("A"); expect(p).toContain("25 min");
  });
  it("todayStr is YYYY-MM-DD", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
