"use client";
import { useEffect, useRef, useState } from "react";
import { AI_ACTIONS, replaceSelection, type AiAction } from "@/lib/ai.action";

export function SelectionActions({ noteId, onResult }: { noteId: string; onResult: (action: string, result: string, replaceSel: boolean) => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function showAt(x: number, y: number, text: string) {
      const bar = ref.current;
      const w = bar?.offsetWidth ?? 240;
      const h = bar?.offsetHeight ?? 36;
      setSelection(text);
      setPos({ x: Math.min(Math.max(x, w / 2 + 8), window.innerWidth - w / 2 - 8), y: Math.max(y - 8, h + 8) });
    }

    function onMouseUp() {
      const el = document.activeElement;
      if (el instanceof HTMLTextAreaElement && el.selectionStart !== el.selectionEnd) {
        const text = el.value.slice(el.selectionStart, el.selectionEnd).trim();
        if (!text) return setPos(null);
        const r = el.getBoundingClientRect();
        showAt(r.left + r.width / 2, r.top, text);
      } else {
        const sel = window.getSelection()?.toString().trim() ?? "";
        if (!sel) return setPos(null);
        const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
        if (!rect) return;
        showAt(rect.left + rect.width / 2, rect.top, sel);
      }
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  async function run(action: AiAction) {
    setBusy(true);
    const res = await fetch(`/api/notes/${noteId}/ai/action`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: selection, action }) });
    if (!res.ok) { setBusy(false); setPos(null); return; }
    const data = await res.json();
    if (data.result) onResult(action, data.result, replaceSelection(action));
    setBusy(false);
    setPos(null);
  }

  if (!pos) return null;
  return (
    <div ref={ref} onMouseDown={(e) => e.preventDefault()} className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900" style={{ left: pos.x, top: pos.y }}>
      {busy ? <span className="px-2 text-xs text-neutral-400">Working…</span> : (
        <div className="flex gap-1">
          {AI_ACTIONS.map((a) => <button key={a} onClick={() => run(a)} className="rounded px-2 py-1 text-xs capitalize hover:bg-neutral-100 dark:hover:bg-neutral-800">{a}</button>)}
        </div>
      )}
    </div>
  );
}
