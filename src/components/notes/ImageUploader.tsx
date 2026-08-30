"use client";
import { useRef } from "react";
import { ImagePlus } from "lucide-react";

export function ImageUploader({ noteId, onInsert }: { noteId: string; onInsert: (md: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("noteId", noteId);
    const res = await fetch("/api/images/upload", { method: "POST", body: form });
    if (!res.ok) return alert((await res.json()).error ?? "Upload failed");
    const { id } = await res.json();
    onInsert(`\n![${file.name}](${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/images/${id})\n`);
    e.target.value = "";
  }

  return (
    <>
      <button onClick={() => ref.current?.click()} className="rounded-md p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" title="Upload image">
        <ImagePlus size={16} />
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onChange} />
    </>
  );
}
