"use client";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, X } from "lucide-react";

export function AiPanel({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: `/api/notes/${noteId}/ai/chat` }),
  });
  const [input, setInput] = useState("");
  const thinking = status === "submitted" || status === "streaming";

  return (
    <aside className="flex h-full w-full flex-col border-l border-neutral-200 bg-white md:w-80 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <span className="flex items-center gap-2 text-sm font-medium"><Sparkles size={14} /> AI</span>
        <button onClick={onClose} className="rounded p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><X size={14} /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[90%] rounded-lg px-3 py-2 ${m.role === "user" ? "ml-auto bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "bg-neutral-100 dark:bg-neutral-800"}`}>
            {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
          </div>
        ))}
        {thinking && <div className="text-neutral-400">Thinking…</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage({ text: input }); setInput(""); } }} className="border-t border-neutral-200 p-2 dark:border-neutral-800">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this note…" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700" />
      </form>
    </aside>
  );
}
