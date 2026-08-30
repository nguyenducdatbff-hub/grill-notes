import { describe, expect, it } from "vitest";
import { newShareToken } from "./share";

describe("newShareToken", () => {
  it("produces 32-char hex tokens, unique", () => {
    const a = newShareToken(); const b = newShareToken();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });
});
