import { describe, expect, it } from "vitest";
import { orderTasks } from "./tasks";

describe("orderTasks", () => {
  it("incomplete first, then done, both by position", () => {
    const rows = [
      { id: "1", title: "a", done: true, position: 0 },
      { id: "2", title: "b", done: false, position: 1 },
    ];
    const ordered = orderTasks(rows);
    expect(ordered.map((t) => t.id)).toEqual(["2", "1"]);
  });
});
