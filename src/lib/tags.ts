export function syncTagLists(names: string[], existing: { id: string; name: string }[]) {
  const clean = [...new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean))];
  const byName = new Map(existing.map((t) => [t.name.toLowerCase(), t.id]));
  const toLink = clean.filter((n) => byName.has(n)).map((n) => byName.get(n)!);
  const toCreate = clean.filter((n) => !byName.has(n));
  return { toCreate, toLink };
}
