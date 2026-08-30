"use client";
import { useEffect, useRef, useState } from "react";
import { AI_ACTIONS, replaceSelection, type AiAction } from "@/lib/ai.action";

export function SelectionActions({ noteId, onResult }: { noteId: string; onResult: (action: string, result: string, replaceSel: boolean) => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseUp() {
      const sel = window.getSelection()?.toString().trim() ?? "";
      if (!sel) return setPos(null);
      const r = window.getSelection()?.getRangeAt(0);
      const rect = r?.getBoundingClientRect();
      if (!rect) return;
      setSelection(sel);
      setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  async function run(action: AiAction) {
    setBusy(true);
    const res = await fetch(`/api/notes/${noteId}/ai/action`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: selection, action }) });
    const data = await res.json();
    if (data.result) onResult(action, data.result, replaceSelection(action));
    setBusy(false);
    setPos(null);
  }

  if (!pos) return null;
  return (
    <div ref={ref} className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900" style={{ left: pos.x, top: pos.y }}>
      {busy ? <span className="px-2 text-xs text-neutral-400">Working…</span> : (
        <div className="flex gap-1">
          {AI_ACTIONS.map((a) => <button key={a} onClick={() => run(a)} className="rounded px-2 py-1 text-xs capitalize hover:bg-neutral-100 dark:hover:bg-neutral-800">{a}</button>)}
        </div>
      )}
    </div>
  );
}
