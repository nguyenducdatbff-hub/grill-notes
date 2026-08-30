import { describe, expect, it } from "vitest";
import { bucketByDay, type FocusRow } from "./focus";

describe("bucketByDay", () => {
  it("aggregates minutes per day", () => {
    const rows: FocusRow[] = [
      { startAt: new Date("2026-08-29T10:00:00Z"), durationSec: 1500 },
      { startAt: new Date("2026-08-29T12:00:00Z"), durationSec: 300 },
      { startAt: new Date("2026-08-28T10:00:00Z"), durationSec: 600 },
    ];
    const b = bucketByDay(rows);
    expect(b["2026-08-29"]).toBe(30);
    expect(b["2026-08-28"]).toBe(10);
  });
});
