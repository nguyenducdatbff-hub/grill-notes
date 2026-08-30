import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notes, tags, noteTags } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { syncTagLists } from "@/lib/tags";

const Schema = z.object({ tags: z.array(z.string().max(50)).max(50) });

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { tags: names } = Schema.parse(await req.json());
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await db.select().from(tags).where(eq(tags.userId, user.id));
  const { toCreate, toLink } = syncTagLists(names, existing);
  const created = toCreate.length ? await db.insert(tags).values(toCreate.map((name) => ({ userId: user.id, name }))).returning() : [];
  const ids = [...toLink, ...created.map((t) => t.id)];

  await db.delete(noteTags).where(eq(noteTags.noteId, id));
  if (ids.length) await db.insert(noteTags).values(ids.map((tagId) => ({ noteId: id, tagId })));

  return NextResponse.json(ids);
}
