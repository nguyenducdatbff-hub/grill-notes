"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, X } from "lucide-react";

export function AiPanel({ noteId, onClose, seed }: { noteId: string; onClose: () => void; seed?: string | null }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: `/api/notes/${noteId}/ai/chat` }),
  });
  const [input, setInput] = useState("");
  const seedSent = useRef(false);
  const thinking = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (seed && !seedSent.current) {
      seedSent.current = true;
      sendMessage({ text: seed });
    }
  }, [seed, sendMessage]);

  return (
    <aside className="flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] md:w-80">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium"><Sparkles size={14} /> AI</span>
        <button onClick={onClose} className="rounded p-1 text-[var(--muted)] hover:text-[var(--text)]"><X size={14} /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[90%] rounded-lg px-3 py-2 ${m.role === "user" ? "ml-auto bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "bg-[var(--border)]"}`}>
            {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
          </div>
        ))}
        {thinking && <div className="text-[var(--muted)]">Thinking…</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage({ text: input }); setInput(""); } }} className="border-t border-[var(--border)] p-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this note…" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
      </form>
    </aside>
  );
}
