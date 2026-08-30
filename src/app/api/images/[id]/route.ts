import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { images, notes } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");
  const [img] = await db.select().from(images).where(eq(images.id, id));
  if (!img) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let allowed = false;
  try {
    const user = await requireUser();
    allowed = user.id === img.userId;
  } catch { allowed = false; }

  if (!allowed && token) {
    const [note] = img.noteId
      ? await db.select().from(notes).where(and(eq(notes.id, img.noteId), eq(notes.shareToken, token)))
      : [];
    allowed = !!note;
  }

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return new NextResponse(new Uint8Array(img.data), {
    headers: { "content-type": img.mime, "cache-control": "private, max-age=86400" },
  });
}
