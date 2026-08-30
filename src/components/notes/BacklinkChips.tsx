"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWikilinks } from "./useWikilinks";

export function BacklinkChips({ body }: { body: string }) {
  const router = useRouter();
  const { titles, found } = useWikilinks(body);

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
          <Link key={t} href={`/app/notes/${found[t]}`} className="rounded-full bg-[var(--border)] px-3 py-1 text-xs text-[var(--text)] hover:opacity-80">
            [[{t}]]
          </Link>
        ) : (
          <button key={t} onClick={() => createMissing(t)} className="rounded-full border border-dashed px-3 py-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white" title={`Create note "${t}"`}>
            + [[{t}]]
          </button>
        ),
      )}
    </div>
  );
}
