import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { buildGraph } from "@/lib/graph";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select({ id: notes.id, title: notes.title, body: notes.body }).from(notes).where(eq(notes.userId, user.id));
  return NextResponse.json(buildGraph(rows));
}
