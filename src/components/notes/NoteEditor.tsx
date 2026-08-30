"use client";
import { useEffect, useRef, useState } from "react";
import { Eye, Pencil, Sparkles } from "lucide-react";
import { Markdown } from "./Markdown";
import { BacklinkChips } from "./BacklinkChips";
import { TagEditor } from "./TagEditor";
import { ImageUploader } from "./ImageUploader";
import { AiPanel } from "../ai/AiPanel";
import { SelectionActions } from "../ai/SelectionActions";
import { EvaluateBanner } from "../ai/EvaluateBanner";
import type { Evaluation } from "@/lib/ai.evaluate";

export function NoteEditor({ noteId, initialTitle, initialBody }: { noteId: string; initialTitle: string; initialBody: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [aiOpen, setAiOpen] = useState(false);
  const [pendingAi, setPendingAi] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [savedSnap, setSavedSnap] = useState<{ title: string; body: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveSeq = useRef(0);
  const dirty = useRef(false);
  const editSeq = useRef(0);

  useEffect(() => {
    if (!dirty.current) return;
    const seq = ++saveSeq.current;
    timer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/notes/${noteId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, body }) });
        if (!res.ok) throw new Error("save failed");
        if (seq === saveSeq.current) {
          setStatus("saved");
          setSavedSnap({ title, body });
        }
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

  useEffect(() => {
    if (!savedSnap || body !== savedSnap.body) return;
    const seq = editSeq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}/ai/evaluate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(savedSnap) });
        if (!res.ok || editSeq.current !== seq) return;
        setEvaluation(await res.json());
      } catch {
        // evaluation is best-effort; ignore failures
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [savedSnap, body, noteId]);

  const showEdit = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  function handleAiResult(_action: string, result: string, replaceSel: boolean) {
    if (replaceSel) {
      const ta = textareaRef.current;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        dirty.current = true;
        editSeq.current++;
        setEvaluation(null);
        setBody((b) => b.slice(0, start) + result + b.slice(end));
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start + result.length, start + result.length);
        });
      }
      return;
    }
    setPendingAi(result);
    setAiOpen(true);
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input value={title} onChange={(e) => { dirty.current = true; setTitle(e.target.value); }} placeholder="Untitled" className="w-full bg-transparent text-2xl font-semibold outline-none" />
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setMode("edit")} className={`rounded-md p-2 ${mode === "edit" ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="Edit"><Pencil size={16} /></button>
          <button onClick={() => setMode("preview")} className={`rounded-md p-2 ${mode === "preview" ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="Preview"><Eye size={16} /></button>
          <ImageUploader noteId={noteId} onInsert={(md) => { editSeq.current++; setEvaluation(null); setBody((b) => b + md); }} />
          <button onClick={() => setAiOpen((v) => !v)} className={`rounded-md p-2 ${aiOpen ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="AI"><Sparkles size={16} /></button>
          <span className="ml-2 text-xs text-[var(--muted)]">{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Error" : ""}</span>
        </div>
      </div>
      <div className="mb-2">
        <TagEditor noteId={noteId} />
      </div>
      {evaluation && <EvaluateBanner ev={evaluation} onClose={() => setEvaluation(null)} />}
      <div className={`flex min-h-0 flex-1 gap-3 ${mode === "split" || aiOpen ? "flex-col md:flex-row" : ""}`}>
        {showEdit && (
          <textarea ref={textareaRef} value={body} onChange={(e) => { dirty.current = true; editSeq.current++; setEvaluation(null); setBody(e.target.value); }} placeholder="Write in markdown… [[link]] to another note" className="min-h-40 flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm outline-none focus:border-[var(--muted)]" />
        )}
        {showPreview && (
          <div className="min-h-40 flex-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <Markdown content={body} />
          </div>
        )}
        {aiOpen && <AiPanel noteId={noteId} onClose={() => { setAiOpen(false); setPendingAi(null); }} seed={pendingAi} />}
      </div>
      <SelectionActions noteId={noteId} onResult={handleAiResult} />
      <div className="mt-3 shrink-0">
        <BacklinkChips body={body} />
      </div>
    </div>
  );
}
