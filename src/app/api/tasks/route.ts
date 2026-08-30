import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { orderTasks } from "@/lib/tasks";

const CreateSchema = z.object({ title: z.string().min(1).max(300), noteId: z.string().nullable().optional() });

export async function GET() {
  const user = await requireUser();
  const rows = await db.select().from(tasks).where(eq(tasks.userId, user.id)).orderBy(asc(tasks.position));
  return NextResponse.json(orderTasks(rows));
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = CreateSchema.parse(await req.json());
  const [countRow] = await db.select({ c: sql<number>`count(*)` }).from(tasks).where(eq(tasks.userId, user.id));
  const [t] = await db.insert(tasks).values({ userId: user.id, title: body.title, noteId: body.noteId ?? null, position: Number(countRow.c) }).returning();
  return NextResponse.json(t, { status: 201 });
}
