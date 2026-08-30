"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (!query.trim()) return setResults([]);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      setResults(await res.json());
    }, 250);
    return () => clearTimeout(t);
  }, [query, open]);

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Search notes">
      <Command.Input value={query} onValueChange={setQuery} placeholder="Search notes…" autoFocus />
      <Command.List>
        {results.map((r) => (
          <Command.Item key={r.id} onSelect={() => { router.push(`/app/notes/${r.id}`); onOpenChange(false); }}>
            <div>
              <div>{r.title}</div>
              <div className="line-clamp-1 text-xs opacity-60">{r.body}</div>
            </div>
          </Command.Item>
        ))}
        {results.length === 0 && query && <Command.Empty>No notes match &quot;{query}&quot;</Command.Empty>}
      </Command.List>
    </Command.Dialog>
  );
}
