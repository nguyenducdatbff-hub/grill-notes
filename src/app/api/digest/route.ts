import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateText } from "ai";
import { db } from "@/db";
import { digests, aiKeys } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { getModel } from "@/lib/ai";
import { buildDigestInput, buildDigestPrompt, todayStr } from "@/lib/digest";

const Schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(todayStr()) });

export async function GET(req: Request) {
  const user = await requireUser();
  const date = new URL(req.url).searchParams.get("date") ?? todayStr();
  const rows = await db.select().from(digests).where(and(eq(digests.userId, user.id), eq(digests.date, date))).limit(1);
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const { date } = Schema.parse(await req.json());
  const [keyRow] = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  if (!keyRow?.encryptedKey) return NextResponse.json({ error: "No AI key configured" }, { status: 400 });

  const input = await buildDigestInput(user.id, date);
  const { text } = await generateText({
    model: getModel(keyRow.provider, keyRow.model || "", decrypt(keyRow.encryptedKey)),
    prompt: buildDigestPrompt(input),
  });

  const [existing] = await db.select().from(digests).where(and(eq(digests.userId, user.id), eq(digests.date, date)));
  if (existing) await db.update(digests).set({ content: text }).where(eq(digests.id, existing.id));
  else await db.insert(digests).values({ userId: user.id, date, content: text });
  return NextResponse.json({ content: text });
}
