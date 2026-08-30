import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { NoteCreateSchema } from "@/lib/notes";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select().from(notes).where(eq(notes.userId, user.id)).orderBy(desc(notes.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = NoteCreateSchema.parse(await req.json());
  const [note] = await db.insert(notes).values({ userId: user.id, title: body.title, body: body.body }).returning();
  return NextResponse.json(note, { status: 201 });
}
