"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CornerDownRight } from "lucide-react";

export function IncomingBacklinks({ noteId, title }: { noteId: string; title: string }) {
  const [links, setLinks] = useState<{ id: string; title: string }[] | null>(null);
  const validTitle = title.trim().length > 0 && title !== "Untitled";

  useEffect(() => {
    if (!validTitle) return;
    let active = true;
    const t = setTimeout(() => {
      fetch(`/api/notes/${noteId}/backlinks`)
        .then((r) => r.json())
        .then((rows: { id: string; title: string }[]) => {
          if (active) setLinks(rows);
        })
        .catch(() => {
          if (active) setLinks([]);
        });
    }, 400);
    return () => { active = false; clearTimeout(t); };
  }, [noteId, title, validTitle]);

  if (!validTitle || links === null || links.length === 0) return null;
  return (
    <div className="border-t border-[var(--border)] pt-2">
      <p className="mb-1 flex items-center gap-1 text-xs text-[var(--muted)]"><CornerDownRight size={12} /> Linked from</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.id} href={`/app/notes/${l.id}`} className="rounded-full bg-[var(--border)] px-3 py-1 text-xs text-[var(--text)] hover:opacity-80">
            {l.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
