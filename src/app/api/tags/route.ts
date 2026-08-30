import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tags, noteTags } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select({
    id: tags.id, name: tags.name,
    count: sql<number>`count(${noteTags.noteId})`,
  }).from(tags).leftJoin(noteTags, eq(noteTags.tagId, tags.id))
    .where(eq(tags.userId, user.id)).groupBy(tags.id);
  return NextResponse.json(rows);
}
