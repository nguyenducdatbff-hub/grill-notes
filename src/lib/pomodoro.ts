import { useEffect, useRef, useState } from "react";

export type Preset = "pomodoro" | "short" | "long";

export const PRESETS: Record<Preset, number> = { pomodoro: 25 * 60, short: 5 * 60, long: 15 * 60 };

export function presetSeconds(p: Preset): number {
  return PRESETS[p];
}

export function fmt(total: number): string {
  const m = Math.floor(total / 60); const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function usePomodoro(initial: number = PRESETS.pomodoro) {
  const [total, setTotal] = useState(initial);
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      if (endAt.current) setSecondsLeft(Math.max(0, Math.round((endAt.current - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (secondsLeft === 0 && running) setRunning(false);
  }, [secondsLeft, running]);

  const start = () => { endAt.current = Date.now() + secondsLeft * 1000; setRunning(true); };
  const pause = () => { endAt.current = null; setRunning(false); };
  const reset = (next?: number) => { const t = next ?? total; setTotal(t); setSecondsLeft(t); endAt.current = null; setRunning(false); };

  return { secondsLeft, total, running, start, pause, reset, setTotal: (t: number) => reset(t) };
}
