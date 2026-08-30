import { extractBacklinks } from "./markdown";

export type GraphNote = { id: string; title: string; body: string };

export function buildGraph(rows: GraphNote[]) {
  const byTitle = new Map(rows.map((r) => [r.title.toLowerCase(), r.id]));
  const nodes = rows.map((r) => ({ id: r.id, title: r.title, links: 0 }));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const links: { source: string; target: string }[] = [];
  for (const r of rows) {
    for (const t of extractBacklinks(r.body)) {
      const targetId = byTitle.get(t.toLowerCase());
      if (!targetId || targetId === r.id) continue;
      const key = [r.id, targetId].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: r.id, target: targetId });
      nodeById.get(r.id)!.links++;
      nodeById.get(targetId)!.links++;
    }
  }
  return { nodes, links };
}

export function truncateLabel(title: string, max = 30): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

export function fitTransform(
  points: { x?: number; y?: number }[],
  w: number,
  h: number,
  padding = 40,
  maxK = 3
): { k: number; x: number; y: number } {
  if (points.length === 0) return { k: 1, x: 0, y: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    const px = p.x ?? 0, py = p.y ?? 0;
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }
  if (!Number.isFinite(minX)) return { k: 1, x: 0, y: 0 };
  const bw = Math.max(maxX - minX + padding * 2, 1);
  const bh = Math.max(maxY - minY + padding * 2, 1);
  const k = Math.min(maxK, Math.max(0.1, Math.min(w / bw, h / bh)));
  return {
    k,
    x: w / 2 - (k * (minX + maxX)) / 2,
    y: h / 2 - (k * (minY + maxY)) / 2,
  };
}
