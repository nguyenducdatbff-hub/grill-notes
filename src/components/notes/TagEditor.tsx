"use client";
import { useEffect, useRef, useState } from "react";

export function TagEditor({ noteId }: { noteId: string }) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const dirty = useRef(false);

  useEffect(() => {
    fetch(`/api/notes/${noteId}/tags`).then((r) => r.json()).then((names: string[]) => setTags(names));
  }, [noteId]);

  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(async () => {
      await fetch(`/api/notes/${noteId}/tags`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ tags }) });
    }, 500);
    return () => clearTimeout(t);
  }, [tags, noteId]);

  function add() {
    const name = input.trim().toLowerCase();
    if (name && !tags.includes(name)) { setTags([...tags, name]); dirty.current = true; }
    setInput("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((t) => (
        <button key={t} onClick={() => { setTags(tags.filter((x) => x !== t)); dirty.current = true; }} className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
          #{t} ×
        </button>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="+ tag" className="w-20 bg-transparent text-sm outline-none" />
    </div>
  );
}
