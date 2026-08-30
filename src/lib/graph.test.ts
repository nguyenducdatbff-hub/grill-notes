import { describe, expect, it } from "vitest";
import { buildGraph } from "./graph";

describe("buildGraph", () => {
  it("resolves backlinks to note ids and dedupes", () => {
    const notes = [
      { id: "1", title: "React", body: "See [[Hooks]] and [[Hooks]]" },
      { id: "2", title: "Hooks", body: "" },
    ];
    const g = buildGraph(notes);
    expect(g.links).toHaveLength(1);
    expect(g.links[0]).toEqual({ source: "1", target: "2" });
    expect(g.nodes.find((n) => n.id === "1")!.links).toBe(1);
  });
});
