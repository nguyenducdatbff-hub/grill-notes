import { NextResponse } from "next/server";
import { and, desc, eq, ilike, ne } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [note] = await db.select({ title: notes.title }).from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pattern = `%[[${note.title.replace(/[\\%_]/g, "\\$&")}]]%`;
  const rows = await db.select({ id: notes.id, title: notes.title, updatedAt: notes.updatedAt }).from(notes)
    .where(and(eq(notes.userId, user.id), ne(notes.id, id), ilike(notes.body, pattern)))
    .orderBy(desc(notes.updatedAt))
    .limit(50);
  return NextResponse.json(rows.map((r) => ({ id: r.id, title: r.title, updatedAt: r.updatedAt.toISOString() })));
}
