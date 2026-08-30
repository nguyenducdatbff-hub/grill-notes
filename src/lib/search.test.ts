import { describe, expect, it } from "vitest";
import { buildTsVector } from "./search";

describe("buildTsVector", () => {
  it("concatenates title and body", () => {
    expect(buildTsVector("React", "Hooks guide")).toContain("React");
  });
});
