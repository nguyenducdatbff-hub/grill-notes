import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { requireUser } from "@/lib/session";

const PatchSchema = z.object({ title: z.string().min(1).max(300).optional(), done: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const patch = PatchSchema.parse(await req.json());
  const [t] = await db.update(tasks).set({ ...patch, updatedAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.userId, user.id))).returning();
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  return new NextResponse(null, { status: 204 });
}
