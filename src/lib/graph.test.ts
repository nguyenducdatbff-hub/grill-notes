import { describe, expect, it } from "vitest";
import { buildGraph, fitTransform, truncateLabel } from "./graph";

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

describe("truncateLabel", () => {
  it("keeps short titles", () => {
    expect(truncateLabel("Short")).toBe("Short");
  });
  it("truncates long titles with an ellipsis", () => {
    const out = truncateLabel("x".repeat(40));
    expect(out).toHaveLength(30);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("fitTransform", () => {
  it("returns identity for no points", () => {
    expect(fitTransform([], 800, 500)).toEqual({ k: 1, x: 0, y: 0 });
  });
  it("centers the bounding box with padding", () => {
    const t = fitTransform([{ x: 0, y: 0 }, { x: 100, y: 100 }], 500, 300, 40);
    expect(t.k).toBeCloseTo(5 / 3);
    expect(t.x).toBeCloseTo(250 - t.k * 50);
    expect(t.y).toBeCloseTo(150 - t.k * 50);
  });
});
