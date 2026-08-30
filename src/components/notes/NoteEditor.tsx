"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, Pencil, Share2, Sparkles, Trash2 } from "lucide-react";
import { PreviewPane } from "./PreviewPane";
import { BacklinkChips } from "./BacklinkChips";
import { IncomingBacklinks } from "./IncomingBacklinks";
import { TagEditor } from "./TagEditor";
import { ImageUploader } from "./ImageUploader";
import { AiPanel } from "../ai/AiPanel";
import { SelectionActions } from "../ai/SelectionActions";
import { EvaluateBanner } from "../ai/EvaluateBanner";
import type { Evaluation } from "@/lib/ai.evaluate";

function subscribeMatchMedia(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeMatchMedia,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

export function NoteEditor({ noteId, initialTitle, initialBody }: { noteId: string; initialTitle: string; initialBody: string }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [aiOpen, setAiOpen] = useState(false);
  const [pendingAi, setPendingAi] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [savedSnap, setSavedSnap] = useState<{ title: string; body: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveSeq = useRef(0);
  const dirty = useRef(false);
  const editSeq = useRef(0);
  const pendingRef = useRef<{ title: string; body: string } | null>(null);
  const lastSavedRef = useRef<{ title: string; body: string } | null>(null);
  const inFlightRef = useRef<{ title: string; body: string } | null>(null);

  useEffect(() => {
    if (!dirty.current) return;
    pendingRef.current = { title, body };
    const seq = ++saveSeq.current;
    timer.current = setTimeout(async () => {
      setStatus("saving");
      inFlightRef.current = { title, body };
      try {
        const res = await fetch(`/api/notes/${noteId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, body }) });
        if (!res.ok) throw new Error("save failed");
        lastSavedRef.current = { title, body };
        if (pendingRef.current?.title === title && pendingRef.current?.body === body) pendingRef.current = null;
        if (seq === saveSeq.current) {
          setStatus("saved");
          setSavedSnap({ title, body });
        }
      } catch {
        if (seq === saveSeq.current) setStatus("error");
      } finally {
        if (inFlightRef.current?.title === title && inFlightRef.current?.body === body) inFlightRef.current = null;
      }
    }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [title, body, noteId]);

  useEffect(() => {
    const flush = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      const last = lastSavedRef.current;
      if (last && last.title === pending.title && last.body === pending.body) {
        pendingRef.current = null;
        return;
      }
      const inFlight = inFlightRef.current;
      if (inFlight && inFlight.title === pending.title && inFlight.body === pending.body) return;
      pendingRef.current = null;
      fetch(`/api/notes/${noteId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(pending), keepalive: true }).catch(() => {});
    };
    const onBeforeUnload = () => flush();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (timer.current) clearTimeout(timer.current);
      flush();
    };
  }, [noteId]);

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

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const effectiveMode = mode === "split" && !isDesktop ? "edit" : mode;
  const showEdit = effectiveMode === "edit" || effectiveMode === "split";
  const showPreview = effectiveMode === "preview" || effectiveMode === "split";
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

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

  function insertAtCursor(md: string) {
    const ta = textareaRef.current;
    dirty.current = true;
    editSeq.current++;
    setEvaluation(null);
    if (ta && document.activeElement === ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      setBody((b) => b.slice(0, start) + md + b.slice(end));
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start + md.length, start + md.length);
      });
    } else {
      setBody((b) => b + md);
    }
  }

  async function share() {
    const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
    if (!res.ok) return;
    const { url } = await res.json();
    setShareUrl(url);
  }

  async function remove() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) router.replace("/app/notes");
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input value={title} onChange={(e) => { dirty.current = true; setTitle(e.target.value); }} placeholder="Untitled" className="w-full bg-transparent text-2xl font-semibold outline-none" />
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => setMode("edit")} className={`rounded-md p-2 ${effectiveMode === "edit" ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="Edit"><Pencil size={16} /></button>
          <button onClick={() => setMode("preview")} className={`rounded-md p-2 ${effectiveMode === "preview" ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="Preview"><Eye size={16} /></button>
          <ImageUploader noteId={noteId} onInsert={insertAtCursor} insertAtCursor={insertAtCursor} />
          <button onClick={() => setAiOpen((v) => !v)} className={`rounded-md p-2 ${aiOpen ? "bg-[var(--border)]" : "text-[var(--muted)]"}`} title="AI"><Sparkles size={16} /></button>
          <button onClick={share} className="rounded-md p-2 text-[var(--muted)] hover:text-[var(--text)]" title="Share"><Share2 size={16} /></button>
          <button onClick={remove} className="rounded-md p-2 text-[var(--muted)] hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
          <span className="ml-2 hidden text-xs text-[var(--muted)] sm:block">{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Error" : ""}</span>
        </div>
      </div>
      {shareUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm">
          <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 bg-transparent outline-none" />
          <button onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); }} className="rounded-md p-1 text-[var(--muted)] hover:text-[var(--text)]" title="Copy link">
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
          <button onClick={() => setShareUrl(null)} className="rounded-md p-1 text-[var(--muted)] hover:text-[var(--text)]">×</button>
        </div>
      )}
      <div className="mb-2">
        <TagEditor noteId={noteId} />
      </div>
      {evaluation && <EvaluateBanner ev={evaluation} onClose={() => setEvaluation(null)} />}
      <div className={`flex min-h-0 flex-1 gap-3 ${effectiveMode === "split" || aiOpen ? "flex-col md:flex-row" : ""}`}>
        {showEdit && (
          <textarea ref={textareaRef} value={body} onChange={(e) => { dirty.current = true; editSeq.current++; setEvaluation(null); setBody(e.target.value); }} placeholder="Write in markdown… [[link]] to another note" className="min-h-40 flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm outline-none focus:border-[var(--muted)]" />
        )}
        {showPreview && <PreviewPane body={body} />}
        {aiOpen && <AiPanel noteId={noteId} onClose={() => { setAiOpen(false); setPendingAi(null); }} seed={pendingAi} />}
      </div>
      <SelectionActions noteId={noteId} onResult={handleAiResult} />
      <div className="mt-3 shrink-0 space-y-3">
        <BacklinkChips body={body} />
        <IncomingBacklinks noteId={noteId} title={title} />
        <p className="text-right text-xs text-[var(--muted)]">{body.length.toLocaleString()} chars · {wordCount.toLocaleString()} words</p>
      </div>
    </div>
  );
}
