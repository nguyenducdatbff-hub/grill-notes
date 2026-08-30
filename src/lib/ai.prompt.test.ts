import { describe, expect, it } from "vitest";
import { buildChatSystem } from "./ai.prompt";

describe("buildChatSystem", () => {
  it("includes note and related titles", () => {
    const s = buildChatSystem("React", "hooks", ["Other Note"]);
    expect(s).toContain("React"); expect(s).toContain("Other Note");
  });
});
