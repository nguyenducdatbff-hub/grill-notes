import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, aiKeys } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { getModel } from "@/lib/ai";
import { buildChatSystem } from "@/lib/ai.prompt";

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  if (!note) return new Response("Not found", { status: 404 });
  const [keyRow] = await db.select().from(aiKeys).where(eq(aiKeys.userId, user.id));
  if (!keyRow || !keyRow.encryptedKey) return new Response("No AI key configured", { status: 400 });

  const body = (await req.json()) as { messages?: { role: string; content?: string; parts?: unknown[] }[] };
  const raw = body.messages ?? [];
  const messages: UIMessage[] = raw.map((m) =>
    m.parts ? (m as UIMessage) : { role: m.role as UIMessage["role"], parts: [{ type: "text", text: m.content ?? "" }] }
  );
  const titleRows = await db.select({ title: notes.title }).from(notes).where(eq(notes.userId, user.id));
  const titles = titleRows.map((n) => n.title);

  const result = streamText({
    model: getModel(keyRow.provider, keyRow.model || "", decrypt(keyRow.encryptedKey)),
    system: buildChatSystem(note.title, note.body, titles),
    messages: await convertToModelMessages(messages),
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
