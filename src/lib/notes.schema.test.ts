import { describe, expect, it } from "vitest";
import { NotePatchSchema } from "./notes";

describe("NotePatchSchema", () => {
  it("accepts title and body", () => {
    expect(NotePatchSchema.safeParse({ title: "T", body: "B" }).success).toBe(true);
  });
  it("rejects oversized body", () => {
    expect(NotePatchSchema.safeParse({ body: "x".repeat(1_000_001) }).success).toBe(false);
  });
});
