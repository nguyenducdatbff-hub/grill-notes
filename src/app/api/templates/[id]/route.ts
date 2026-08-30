import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await db.delete(templates).where(and(eq(templates.id, id), eq(templates.userId, user.id)));
  return new NextResponse(null, { status: 204 });
}
