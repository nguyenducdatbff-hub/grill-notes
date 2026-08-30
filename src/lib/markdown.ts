export const BACKLINK_RE = /\[\[([^\]]+)\]\]/g;

export function extractBacklinks(md: string): string[] {
  const out = new Set<string>();
  for (const m of md.matchAll(BACKLINK_RE)) out.add(m[1].trim());
  return [...out];
}

export function getNoteTitle(md: string): string {
  const m = md.match(/^\s*#\s+(.+)$/m);
  return m ? m[1].trim() : "Untitled";
}
