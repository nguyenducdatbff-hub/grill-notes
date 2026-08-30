import { describe, expect, it } from "vitest";
import { syncTagLists } from "./tags";

describe("syncTagLists", () => {
  it("adds new names and keeps existing", () => {
    const res = syncTagLists(["react", "ai"], [{ id: "t1", name: "react" }]);
    expect(res.toCreate).toEqual(["ai"]);
    expect(res.toLink).toEqual(["t1"]);
  });
});
