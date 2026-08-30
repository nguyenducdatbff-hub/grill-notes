import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { TemplateSchema } from "@/lib/templates";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select().from(templates).where(eq(templates.userId, user.id)).orderBy(desc(templates.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = TemplateSchema.parse(await req.json());
  const [t] = await db.insert(templates).values({ userId: user.id, ...body }).returning();
  return NextResponse.json(t, { status: 201 });
}
