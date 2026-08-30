"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Template = { id: string; name: string; body: string };

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  async function create() {
    if (!name.trim()) return;
    const res = await fetch("/api/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, body }) });
    const t = await res.json();
    setTemplates((prev) => [t, ...prev]);
    setName(""); setBody("");
  }

  async function applyTemplate(t: Template) {
    const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: t.name, body: t.body }) });
    const note = await res.json();
    router.push(`/app/notes/${note.id}`);
  }

  async function remove(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Markdown body" className="h-32 w-full rounded border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700" />
        <button onClick={create} className="flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white dark:bg-neutral-100 dark:text-black"><Plus size={16} /> Save template</button>
      </div>
      <ul className="space-y-2">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <button className="min-w-0 flex-1 text-left" onClick={() => applyTemplate(t)}>
              <span className="block font-medium">{t.name}</span>
              <span className="line-clamp-1 text-xs text-neutral-500">{t.body}</span>
            </button>
            <button onClick={() => remove(t.id)} className="ml-2 rounded-md p-2 text-neutral-400 hover:text-red-600"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
