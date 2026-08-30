import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { aiKeys } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { encrypt } from "@/lib/crypto";
import { DEFAULT_MODELS } from "@/lib/ai";

const PutSchema = z.object({
  provider: z.enum(["openai", "anthropic", "google", "openrouter"]),
  model: z.string().max(200),
  apiKey: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const user = await requireUser();
  const [row] = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  return NextResponse.json(row
    ? { provider: row.provider, model: row.model, configured: true }
    : { provider: "openai", model: DEFAULT_MODELS.openai, configured: false });
}

export async function PUT(req: Request) {
  const user = await requireUser();
  const body = PutSchema.parse(await req.json());
  const existing = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  const fields = { provider: body.provider, model: body.model, updatedAt: new Date() };
  if (body.apiKey) Object.assign(fields, { encryptedKey: encrypt(body.apiKey) });
  if (existing.length) await db.update(aiKeys).set(fields).where(eq(aiKeys.userId, user.id));
  else await db.insert(aiKeys).values({ userId: user.id, encryptedKey: encrypt(""), ...fields });
  return NextResponse.json({ ok: true });
}
