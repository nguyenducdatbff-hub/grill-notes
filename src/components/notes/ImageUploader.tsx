"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export function ImageUploader({ noteId, onInsert, insertAtCursor }: { noteId: string; onInsert: (md: string) => void; insertAtCursor?: (md: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("noteId", noteId);
      const res = await fetch("/api/images/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error ?? "Upload failed");
        return;
      }
      const { id } = await res.json();
      const md = `\n![${file.name}](${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/images/${id})\n`;
      if (insertAtCursor) insertAtCursor(md);
      else onInsert(md);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <>
      <button onClick={() => ref.current?.click()} disabled={uploading} className="rounded-md p-2 text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50" title="Upload image">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onChange} />
    </>
  );
}
