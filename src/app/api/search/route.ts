import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { searchNotes } from "@/lib/search";

export async function GET(req: Request) {
  const user = await requireUser();
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  return NextResponse.json(await searchNotes(user.id, q.trim()));
}
