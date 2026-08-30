"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { extractBacklinks } from "@/lib/markdown";

export function BacklinkChips({ body }: { body: string }) {
  const router = useRouter();
  const [found, setFound] = useState<Record<string, string>>({});

  const titles = useMemo(() => extractBacklinks(body), [body]);

  useEffect(() => {
    if (titles.length === 0) return;
    let active = true;
    fetch(`/api/notes/resolve?titles=${titles.map(encodeURIComponent).join(",")}`)
      .then((r) => r.json())
      .then(({ found }: { found: { title: string; id: string }[] }) => {
        if (active) setFound(Object.fromEntries(found.map((f) => [f.title, f.id])));
      });
    return () => { active = false; };
  }, [titles]);

  async function createMissing(title: string) {
    const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) });
    if (!res.ok) return;
    const note = await res.json();
    router.push(`/app/notes/${note.id}`);
  }

  if (titles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {titles.map((t) =>
        found[t] ? (
          <Link key={t} href={`/app/notes/${found[t]}`} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200">
            [[{t}]]
          </Link>
        ) : (
          <button key={t} onClick={() => createMissing(t)} className="rounded-full border border-dashed px-3 py-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white" title={`Create note "${t}"`}>
            + [[{t}]]
          </button>
        )
      )}
    </div>
  );
}
