"use client";
import { useEffect, useMemo, useState } from "react";
import { extractBacklinks } from "@/lib/markdown";

export function useWikilinks(body: string) {
  const titles = useMemo(() => extractBacklinks(body), [body]);
  const [found, setFound] = useState<Record<string, string>>({});

  useEffect(() => {
    if (titles.length === 0) return;
    let active = true;
    fetch(`/api/notes/resolve?titles=${titles.map(encodeURIComponent).join(",")}`)
      .then((r) => r.json())
      .then(({ found }: { found: { title: string; id: string }[] }) => {
        if (active) setFound(Object.fromEntries(found.map((f) => [f.title, f.id])));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [titles]);

  return { titles, found };
}
