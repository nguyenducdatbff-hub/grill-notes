"use client";
import { useRouter } from "next/navigation";
import { useOptimistic } from "react";
import { Plus, Trash2 } from "lucide-react";

export type NoteRow = { id: string; title: string; updatedAt: string };

export function NoteList({ initial }: { initial: NoteRow[] }) {
  const router = useRouter();
  const [notes, setNotes] = useOptimistic(initial, (_state, action: NoteRow[]) => action);

  async function createNote() {
    const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const note = await res.json();
    router.push(`/app/notes/${note.id}`);
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    setNotes(notes.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <button onClick={createNote} className="flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white dark:bg-neutral-100 dark:text-black">
          <Plus size={16} /> New note
        </button>
      </div>
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <button className="min-w-0 flex-1 text-left" onClick={() => router.push(`/app/notes/${n.id}`)}>
              <span className="block truncate font-medium">{n.title}</span>
              <span className="text-xs text-neutral-500">{new Date(n.updatedAt).toLocaleString()}</span>
            </button>
            <button onClick={() => remove(n.id)} className="ml-2 rounded-md p-2 text-neutral-400 opacity-0 transition group-hover:opacity-100 hover:text-red-600" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {notes.length === 0 && <li className="rounded-lg border border-dashed p-8 text-center text-neutral-500">No notes yet. Create your first one.</li>}
      </ul>
    </div>
  );
}
