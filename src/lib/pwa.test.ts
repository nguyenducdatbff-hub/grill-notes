import { describe, expect, it } from "vitest";
import { buildManifest } from "./pwa";

describe("buildManifest", () => {
  it("names the app", () => {
    expect(buildManifest("https://app.example.com").name).toBe("Grill");
  });
});
