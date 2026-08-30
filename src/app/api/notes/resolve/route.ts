import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { matchBacklinks } from "@/lib/backlinks";

export async function GET(req: Request) {
  await requireUser();
  const { searchParams } = new URL(req.url);
  const titles = searchParams.get("titles")?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  if (titles.length === 0) return NextResponse.json({ found: [], missing: [] });
  const exact = await db.select({ id: notes.id, title: notes.title }).from(notes)
    .where(inArray(notes.title, titles));
  return NextResponse.json(matchBacklinks(titles, exact));
}
