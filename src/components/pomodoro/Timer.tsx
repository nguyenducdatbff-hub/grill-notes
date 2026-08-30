"use client";
import { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { PRESETS, fmt, usePomodoro, type Preset } from "@/lib/pomodoro";

export function Timer({ onComplete }: { onComplete: (preset: Preset, seconds: number) => void }) {
  const { secondsLeft, total, running, start, pause, reset } = usePomodoro();
  const presetRef = useRef<Preset>("pomodoro");
  const completedRef = useRef(false);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      completedRef.current = true;
      if (typeof AudioContext !== "undefined") {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
      setTimeout(() => onComplete(presetRef.current, total), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const ring = ((total - secondsLeft) / total) * 100;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="6" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - (ring / 100) * C} className="stroke-neutral-900 transition-all dark:stroke-neutral-100" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tabular-nums">{fmt(secondsLeft)}</span>
      </div>
      <div className="flex gap-1">
        {(Object.keys(PRESETS) as Preset[]).map((p) => (
          <button key={p} onClick={() => reset(PRESETS[p])} className="rounded-md px-2 py-1 text-xs capitalize text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">{p}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={running ? pause : start} className="flex items-center gap-1 rounded-full bg-neutral-900 px-5 py-2 text-white dark:bg-neutral-100 dark:text-black">
          {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => reset()} className="rounded-full border p-2 text-neutral-500"><RotateCcw size={16} /></button>
      </div>
    </div>
  );
}
