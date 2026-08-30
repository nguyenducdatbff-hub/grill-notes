"use client";
import { useEffect, useRef, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Markdown } from "./Markdown";
import { BacklinkChips } from "./BacklinkChips";
import { TagEditor } from "./TagEditor";
import { ImageUploader } from "./ImageUploader";

export function NoteEditor({ noteId, initialTitle, initialBody }: { noteId: string; initialTitle: string; initialBody: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSeq = useRef(0);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    const seq = ++saveSeq.current;
    timer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/notes/${noteId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, body }) });
        if (!res.ok) throw new Error("save failed");
        if (seq === saveSeq.current) setStatus("saved");
      } catch {
        if (seq === saveSeq.current) setStatus("error");
      }
    }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [title, body, noteId]);

  useEffect(() => {
    if (status === "saved" || status === "error") {
      const t = setTimeout(() => setStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const showEdit = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input value={title} onChange={(e) => { dirty.current = true; setTitle(e.target.value); }} placeholder="Untitled" className="w-full bg-transparent text-2xl font-semibold outline-none" />
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setMode("edit")} className={`rounded-md p-2 ${mode === "edit" ? "bg-neutral-200 dark:bg-neutral-800" : "text-neutral-400"}`} title="Edit"><Pencil size={16} /></button>
          <button onClick={() => setMode("preview")} className={`rounded-md p-2 ${mode === "preview" ? "bg-neutral-200 dark:bg-neutral-800" : "text-neutral-400"}`} title="Preview"><Eye size={16} /></button>
          <ImageUploader noteId={noteId} onInsert={(md) => setBody((b) => b + md)} />
          <span className="ml-2 text-xs text-neutral-400">{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Error" : ""}</span>
        </div>
      </div>
      <div className="mb-2">
        <TagEditor noteId={noteId} />
      </div>
      <div className={`flex min-h-0 flex-1 gap-3 ${mode === "split" ? "flex-col md:flex-row" : ""}`}>
        {showEdit && (
          <textarea value={body} onChange={(e) => { dirty.current = true; setBody(e.target.value); }} placeholder="Write in markdown… [[link]] to another note" className="min-h-40 flex-1 resize-none rounded-lg border border-neutral-200 bg-white p-4 font-mono text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600" />
        )}
        {showPreview && (
          <div className="min-h-40 flex-1 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Markdown content={body} />
          </div>
        )}
      </div>
      <div className="mt-3 shrink-0">
        <BacklinkChips body={body} />
      </div>
    </div>
  );
}
