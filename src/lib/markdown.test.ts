import { describe, expect, it } from "vitest";
import { getNoteTitle } from "./markdown";

describe("getNoteTitle", () => {
  it("uses first h1", () => expect(getNoteTitle("# Hello\nbody")).toBe("Hello"));
  it("falls back to Untitled", () => expect(getNoteTitle("just text")).toBe("Untitled"));
});
