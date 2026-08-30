import { NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { focusSessions } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { bucketByDay } from "@/lib/focus";

export async function GET(req: Request) {
  const user = await requireUser();
  const days = Math.min(30, Number(new URL(req.url).searchParams.get("days") ?? 7));
  const from = new Date(Date.now() - days * 86400_000);
  const rows = await db.select({ startAt: focusSessions.startAt, durationSec: focusSessions.durationSec })
    .from(focusSessions).where(and(eq(focusSessions.userId, user.id), gte(focusSessions.startAt, from)));
  const buckets = bucketByDay(rows);
  const dayList = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400_000).toISOString().slice(0, 10);
    return { date: d, minutes: buckets[d] ?? 0 };
  });
  const totalMinutes = dayList.reduce((s, d) => s + d.minutes, 0);
  return NextResponse.json({ days: dayList, totalMinutes, sessions: rows.length });
}
