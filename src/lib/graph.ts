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
