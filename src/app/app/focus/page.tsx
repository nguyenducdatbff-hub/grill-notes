"use client";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Timer } from "@/components/pomodoro/Timer";
import { FocusMode } from "@/components/pomodoro/FocusMode";
import { MiniTasks } from "@/components/pomodoro/MiniTasks";

export default function FocusPage() {
  const [focused, setFocused] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function record(preset: string, seconds: number) {
    await fetch("/api/focus", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ preset, durationSec: seconds, startedAt: new Date(Date.now() - seconds * 1000).toISOString(), completed: true, noteId: note }) });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 pt-6">
      <h1 className="text-2xl font-semibold">Focus</h1>
      <button onClick={() => setFocused(true)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><Maximize2 size={14} /> Enter focus mode</button>
      <Timer onComplete={(p, s) => record(p, s)} />
      <MiniTasks />
      {focused && <FocusMode onClose={() => setFocused(false)} onComplete={(s) => record("pomodoro", s)} />}
    </div>
  );
}
