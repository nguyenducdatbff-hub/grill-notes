import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { newShareToken } from "@/lib/share";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const token = newShareToken();
  const [note] = await db.update(notes).set({ shareToken: token }).where(and(eq(notes.id, id), eq(notes.userId, user.id))).returning();
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/s/${token}`;
  return NextResponse.json({ url });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await db.update(notes).set({ shareToken: null }).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  return new NextResponse(null, { status: 204 });
}
