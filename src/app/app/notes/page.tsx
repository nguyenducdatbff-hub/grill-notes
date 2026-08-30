import { db } from "@/db";
import { notes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const user = await requireUser();
  const rows = await db.select().from(notes).where(eq(notes.userId, user.id)).orderBy(desc(notes.updatedAt));
  return <NoteList initial={rows.map((n) => ({ id: n.id, title: n.title, updatedAt: n.updatedAt.toISOString() }))} />;
}
