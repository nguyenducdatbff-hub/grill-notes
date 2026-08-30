export type FocusRow = { startAt: Date; durationSec: number };

export function bucketByDay(rows: FocusRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const day = r.startAt.toISOString().slice(0, 10);
    out[day] = (out[day] ?? 0) + Math.round(r.durationSec / 60);
  }
  return out;
}
