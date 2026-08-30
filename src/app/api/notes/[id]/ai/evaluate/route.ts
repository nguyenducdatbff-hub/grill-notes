import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateText } from "ai";
import { db } from "@/db";
import { notes, aiKeys } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { getModel } from "@/lib/ai";
import { buildEvaluatePrompt, parseEvaluation } from "@/lib/ai.evaluate";

const Schema = z.object({ title: z.string().max(200), body: z.string().max(1_000_000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = Schema.parse(await req.json());
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [keyRow] = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  if (!keyRow?.encryptedKey) return NextResponse.json({ error: "No AI key configured" }, { status: 400 });

  const { text } = await generateText({
    model: getModel(keyRow.provider, keyRow.model || "", decrypt(keyRow.encryptedKey)),
    prompt: buildEvaluatePrompt(body.title, body.body),
    temperature: 0.4,
  });
  return NextResponse.json(parseEvaluation(text));
}
