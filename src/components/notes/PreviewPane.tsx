"use client";
import { Markdown } from "./Markdown";
import { useWikilinks } from "./useWikilinks";

export function PreviewPane({ body }: { body: string }) {
  const { found } = useWikilinks(body);
  return (
    <div className="min-h-40 flex-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <Markdown content={body} wikilinks={found} />
    </div>
  );
}
