import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateText } from "ai";
import { db } from "@/db";
import { aiKeys } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { getModel } from "@/lib/ai";
import { AI_ACTIONS, buildActionPrompt, replaceSelection } from "@/lib/ai.action";

const Schema = z.object({ text: z.string().min(1).max(8000), action: z.enum(AI_ACTIONS) });

export async function POST(req: Request) {
  const user = await requireUser();
  const body = Schema.parse(await req.json());
  const [keyRow] = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  if (!keyRow?.encryptedKey) return NextResponse.json({ error: "No AI key configured" }, { status: 400 });
  const { text } = await generateText({
    model: getModel(keyRow.provider, keyRow.model || "", decrypt(keyRow.encryptedKey)),
    prompt: buildActionPrompt(body.action, body.text),
  });
  return NextResponse.json({ result: text.trim(), replaceSelection: replaceSelection(body.action) });
}
