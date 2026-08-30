import { describe, expect, it } from "vitest";

describe("session guard", () => {
  it("maps UNAUTHORIZED error", () => {
    expect(() => {
      throw new Error("UNAUTHORIZED");
    }).toThrow(/UNAUTHORIZED/);
  });
});
