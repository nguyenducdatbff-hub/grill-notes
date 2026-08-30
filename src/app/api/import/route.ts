import { NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { noteTitleFromFile } from "@/lib/zip";

export async function POST(req: Request) {
  const user = await requireUser();
  const contentLength = Number(req.headers.get("content-length"));
  if (!Number.isNaN(contentLength) && contentLength > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  let count = 0;
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || !path.endsWith(".md")) continue;
    const content = await entry.async("string");
    await db.insert(notes).values({ userId: user.id, title: noteTitleFromFile(content, path.split("/").pop() ?? path), body: content });
    count++;
  }
  return NextResponse.json({ count });
}
