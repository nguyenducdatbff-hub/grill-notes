"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Stats = { days: { date: string; minutes: number }[]; totalMinutes: number; sessions: number };

export function FocusStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/focus/stats?days=7").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return null;
  return (
    <div className="w-full space-y-2 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-baseline justify-between">
        <h2 className="font-medium">Last 7 days</h2>
        <span className="text-sm text-neutral-500">{stats.totalMinutes} min · {stats.sessions} sessions</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={stats.days}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="minutes" fill="currentColor" className="fill-neutral-900 dark:fill-neutral-100" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
