import { describe, expect, it } from "vitest";
import { TemplateSchema } from "./templates";

describe("TemplateSchema", () => {
  it("requires name and body", () => {
    expect(TemplateSchema.safeParse({ name: "Daily", body: "# Daily" }).success).toBe(true);
    expect(TemplateSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
