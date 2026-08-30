import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";

const Schema = z.object({
  provider: z.string(), model: z.string(), apiKey: z.string().min(1),
});

export async function POST(req: Request) {
  const body = Schema.parse(await req.json());
  try {
    const { text } = await generateText({ model: getModel(body.provider, body.model, body.apiKey), prompt: "Reply with exactly: OK" });
    return NextResponse.json({ ok: text.trim().toUpperCase().includes("OK") });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Test failed" }, { status: 400 });
  }
}
