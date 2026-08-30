"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Task = { id: string; title: string; done: boolean; position: number };

export function MiniTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => { fetch("/api/tasks").then((r) => r.json()).then(setTasks); }, []);

  async function add() {
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) });
    const created = await res.json();
    setTasks((prev) => [...prev, created]);
    setTitle("");
  }

  async function toggle(t: Task) {
    const res = await fetch(`/api/tasks/${t.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ done: !t.done }) });
    const updated = await res.json();
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  }

  async function remove(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a task…" className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700" />
        <button onClick={add} className="rounded-lg border p-2 text-neutral-500"><Plus size={16} /></button>
      </div>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
            <input type="checkbox" checked={t.done} onChange={() => toggle(t)} className="h-4 w-4" />
            <span className={`flex-1 ${t.done ? "line-through opacity-50" : ""}`}>{t.title}</span>
            <button onClick={() => remove(t.id)} className="text-neutral-400 hover:text-red-600"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
