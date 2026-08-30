"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";

export type NoteRow = { id: string; title: string; updatedAt: string };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

type SearchHit = { id: string; title: string; body: string };

function subscribeMatchMedia(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMatchMedia,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

export function NoteList({ initial }: { initial: NoteRow[] }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{ q: string; hits: SearchHit[] | null; searching: boolean }>({ q: "", hits: null, searching: false });
  const searchSeq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const seq = ++searchSeq.current;
    const t = setTimeout(async () => {
      setSearch((s) => ({ ...s, q, searching: true }));
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok || searchSeq.current !== seq) return;
        setSearch({ q, hits: await res.json(), searching: false });
      } catch {
        if (searchSeq.current === seq) setSearch({ q, hits: [], searching: false });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function createNote() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      if (!res.ok) return;
      const note = await res.json();
      router.push(`/app/notes/${note.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    const removed = notes.find((n) => n.id === id);
    setNotes(notes.filter((n) => n.id !== id));
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      if (removed) setNotes((prev) => [...prev, removed]);
      alert("Could not delete this note. Please try again.");
    }
  }

  const searchingMode = query.trim().length > 0;
  const hits = searchingMode && search.q === query.trim() ? search.hits : null;
  const searching = searchingMode && search.q === query.trim() && search.searching;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <button onClick={createNote} disabled={creating} className="flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-black">
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} New note
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--muted)]" />
      </div>
      <ul className="space-y-2">
        {(hits ?? notes).map((n) => (
          <li key={n.id} className="group flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <button className="min-w-0 flex-1 text-left" onClick={() => router.push(`/app/notes/${n.id}`)}>
              <span className="block truncate font-medium">{n.title}</span>
              {"body" in n && n.body && <span className="block truncate text-xs text-[var(--muted)]">{n.body}</span>}
              <span className="text-xs text-[var(--muted)]">{"body" in n ? "" : timeAgo(n.updatedAt)}</span>
            </button>
            <button onClick={() => remove(n.id)} className={`ml-2 rounded-md p-2 text-[var(--muted)] transition hover:text-red-600 ${isMobile ? "" : "opacity-0 group-hover:opacity-100"}`} aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {searchingMode && searching && <li className="p-4 text-center text-sm text-[var(--muted)]">Searching…</li>}
        {searchingMode && !searching && (hits?.length ?? 0) === 0 && <li className="rounded-lg border border-dashed p-8 text-center text-[var(--muted)]">No notes match “{query.trim()}”.</li>}
        {!searchingMode && notes.length === 0 && (
          <li className="rounded-lg border border-dashed p-8 text-center text-[var(--muted)]">
            No notes yet.
            <button onClick={createNote} className="mt-2 block w-full text-[var(--text)] underline underline-offset-4">Create your first one</button>
          </li>
        )}
      </ul>
    </div>
  );
}
