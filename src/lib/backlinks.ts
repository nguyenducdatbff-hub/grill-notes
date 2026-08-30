export function matchBacklinks(titles: string[], existing: { id: string; title: string }[]) {
  const byLower = new Map(existing.map((n) => [n.title.toLowerCase(), n]));
  const found: { title: string; id: string }[] = [];
  const missing: string[] = [];
  for (const t of titles) {
    const hit = byLower.get(t.toLowerCase());
    if (hit) found.push({ title: t, id: hit.id });
    else missing.push(t);
  }
  return { found, missing };
}
