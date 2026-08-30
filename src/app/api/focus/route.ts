import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { focusSessions } from "@/db/schema";
import { requireUser } from "@/lib/session";

const Schema = z.object({
  preset: z.string().default("pomodoro"),
  durationSec: z.number().int().positive(),
  startedAt: z.string().datetime(),
  completed: z.boolean().default(true),
  noteId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const body = Schema.parse(await req.json());
  await db.insert(focusSessions).values({
    userId: user.id,
    noteId: body.noteId ?? null,
    startAt: new Date(body.startedAt),
    endAt: new Date(),
    durationSec: body.durationSec,
    completed: body.completed,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET(req: Request) {
  const user = await requireUser();
  const from = new URL(req.url).searchParams.get("from");
  const rows = await db.select().from(focusSessions)
    .where(and(...(from ? [gte(focusSessions.startAt, new Date(from))] : []), eq(focusSessions.userId, user.id)))
    .orderBy(desc(focusSessions.startAt)).limit(50);
  return NextResponse.json(rows);
}
