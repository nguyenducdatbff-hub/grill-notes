import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { images } from "@/db/schema";
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
  const noteId = typeof noteIdRaw === "string" && z.string().uuid().safeParse(noteIdRaw).success ? noteIdRaw : null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(images).values({
    userId: user.id, noteId, data: buffer, mime: file.type, size: buffer.length,
  }).returning();
  return NextResponse.json({ id: row.id }, { status: 201 });
}
