import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { NotePatchSchema } from "@/lib/notes";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const patch = NotePatchSchema.parse(await req.json());
  const [note] = await db.update(notes).set({ ...patch, updatedAt: new Date() }).where(and(eq(notes.id, id), eq(notes.userId, user.id))).returning();
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  return new NextResponse(null, { status: 204 });
}
