import { describe, expect, it } from "vitest";
import { matchBacklinks } from "./backlinks";

describe("matchBacklinks", () => {
  it("matches titles case-insensitively", () => {
    const res = matchBacklinks(["React Hooks"], [{ id: "1", title: "react hooks" }]);
    expect(res).toEqual({ found: [{ title: "React Hooks", id: "1" }], missing: [] });
  });
});
