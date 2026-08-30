import { NextResponse } from "next/server";
import JSZip from "jszip";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { sanitizeFilename } from "@/lib/zip";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select().from(notes).where(eq(notes.userId, user.id)).orderBy(desc(notes.updatedAt));
  const zip = new JSZip();
  const used = new Set<string>();
  for (const n of rows) {
    let name = sanitizeFilename(`${n.title}.md`);
    while (used.has(name)) name = `${name.slice(0, -3)}-${n.id.slice(0, 8)}.md`;
    used.add(name);
    zip.file(name, n.body);
  }
  const buf = await zip.generateAsync({ type: "nodebuffer" });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buf), { headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="grill-export-${date}.zip"` } });
}
