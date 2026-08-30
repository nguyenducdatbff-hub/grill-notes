import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { matchBacklinks } from "@/lib/backlinks";

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const titles = (searchParams.get("titles") ?? "")
    .split(",").map((t) => decodeURIComponent(t.trim())).filter(Boolean) ?? [];
  if (titles.length === 0) return NextResponse.json({ found: [], missing: [] });
  const lower = titles.map((t) => t.toLowerCase());
  const exact = await db.select({ id: notes.id, title: notes.title }).from(notes)
    .where(and(eq(notes.userId, user.id), inArray(sql`lower(${notes.title})`, lower)));
  return NextResponse.json(matchBacklinks(titles, exact));
}
