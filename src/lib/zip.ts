import { getNoteTitle } from "./markdown";

export function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
}

export function noteTitleFromFile(content: string, filename: string): string {
  const fromHeading = getNoteTitle(content);
  if (fromHeading !== "Untitled") return fromHeading;
  return filename.replace(/\.md$/i, "");
}
