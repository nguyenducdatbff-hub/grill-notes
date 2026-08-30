import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

describe("deployment", () => {
  it("has Dockerfile and railway.json", () => {
    expect(readFileSync("Dockerfile", "utf8")).toContain("npm run db:migrate");
    expect(readFileSync("railway.json", "utf8")).toContain("build");
  });
});
