"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { fmt, usePomodoro } from "@/lib/pomodoro";

export function FocusMode({ onClose, onComplete }: { onClose: () => void; onComplete: (seconds: number) => void }) {
  const { secondsLeft, running, start, pause, reset } = usePomodoro();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (secondsLeft === 0) onComplete(25 * 60);
  }, [secondsLeft, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white">
      <button onClick={onClose} className="absolute right-4 top-4 rounded p-2 text-neutral-400 hover:text-white"><X size={20} /></button>
      <span className="text-[6rem] font-semibold tabular-nums leading-none">{fmt(secondsLeft)}</span>
      <p className="mb-6 text-sm text-neutral-400">Focus mode · ESC to exit</p>
      <div className="flex gap-2">
        <button onClick={running ? pause : start} className="rounded-full bg-white px-6 py-2 text-black">{running ? "Pause" : "Start"}</button>
        <button onClick={() => reset()} className="rounded-full border border-neutral-700 px-6 py-2">Reset</button>
      </div>
    </div>
  );
}
