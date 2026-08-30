import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { images, notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { validateImage } from "@/lib/images";

export async function POST(req: Request) {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const err = validateImage(file.type, file.size);
  if (err) return NextResponse.json({ error: err.message }, { status: 400 });
  const noteIdRaw = form.get("noteId");
  let noteId: string | null = null;
  if (noteIdRaw && typeof noteIdRaw === "string" && z.string().uuid().safeParse(noteIdRaw).success) {
    const [note] = await db.select().from(notes).where(and(eq(notes.id, noteIdRaw), eq(notes.userId, user.id)));
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    noteId = noteIdRaw;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(images).values({
    userId: user.id, noteId, data: buffer, mime: file.type, size: buffer.length,
  }).returning();
  return NextResponse.json({ id: row.id }, { status: 201 });
}
