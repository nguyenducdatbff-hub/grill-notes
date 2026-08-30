import { describe, expect, it } from "vitest";
import { parseEvaluation } from "./ai.evaluate";

describe("parseEvaluation", () => {
  it("parses JSON blocks", () => {
    const raw = '{"strengths":["a"],"suggestions":["b"],"knowledgeToMaster":["c"]}';
    const r = parseEvaluation(raw);
    expect(r.strengths).toEqual(["a"]);
  });
  it("falls back on garbage", () => {
    expect(parseEvaluation("nope").strengths).toEqual([]);
  });
});
