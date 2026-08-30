import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { Markdown } from "@/components/notes/Markdown";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [note] = await db.select().from(notes).where(eq(notes.shareToken, token));
  if (!note) notFound();
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{note.title}</h1>
      <Markdown content={note.body} shareToken={token} />
      <footer className="mt-10 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-400">Shared with Grill</footer>
    </div>
  );
}
