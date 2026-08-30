import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) notFound();
  return <NoteEditor noteId={note.id} initialTitle={note.title} initialBody={note.body} />;
}
