"use client";
import { X } from "lucide-react";
import type { Evaluation } from "@/lib/ai.evaluate";

export function EvaluateBanner({ ev, onClose }: { ev: Evaluation; onClose: () => void }) {
  if (!ev.suggestions.length && !ev.knowledgeToMaster.length) return null;
  return (
    <div className="mb-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">AI review</span>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><X size={14} /></button>
      </div>
      {ev.suggestions.length > 0 && (
        <ul className="mb-2 list-disc pl-5">
          {ev.suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      {ev.knowledgeToMaster.length > 0 && (
        <p className="text-neutral-500">To go deeper: <strong>{ev.knowledgeToMaster.join(", ")}</strong></p>
      )}
    </div>
  );
}
