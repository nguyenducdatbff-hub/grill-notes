"use client";
import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { Markdown } from "@/components/notes/Markdown";
import { todayStr } from "@/lib/date";

export default function DigestPage() {
  const [date, setDate] = useState(todayStr());
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/digest?date=${date}`).then((r) => r.json()).then((row) => setContent(row?.content ?? null));
  }, [date]);

  async function generate() {
    setLoading(true); setError("");
    const res = await fetch("/api/digest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ date }) });
    if (!res.ok) { setError((await res.json()).error ?? "Generate failed."); setLoading(false); return; }
    const r = await res.json();
    setContent(r.content);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Daily digest</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700" />
          <button onClick={generate} disabled={loading} className="flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-black">
            <Wand2 size={14} /> {content ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {content ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <Markdown content={content} />
        </div>
      ) : (
        !loading && <p className="rounded-lg border border-dashed p-8 text-center text-neutral-500">No digest for this date yet. Generate one to recap your day.</p>
      )}
      {loading && <p className="text-center text-sm text-neutral-400">Writing your digest…</p>}
    </div>
  );
}
