import { connection } from "@/db";

export type DigestInput = {
  dateStr: string;
  notes: { title: string }[];
  tasks: { title: string; done: boolean }[];
  focusSecs: number;
  focusSessions: number;
};

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function buildDigestInput(userId: string, dateStr: string): Promise<DigestInput> {
  const today = new Date(`${dateStr}T00:00:00Z`);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const start = yesterday.toISOString();
  const [notes, tasks, focus] = (await Promise.all([
    connection`SELECT title FROM notes WHERE user_id=${userId} AND updated_at >= ${start} AND updated_at < ${today.toISOString()} ORDER BY updated_at DESC LIMIT 20`,
    connection`SELECT title, done FROM tasks WHERE user_id=${userId} AND updated_at >= ${start} AND updated_at < ${today.toISOString()} ORDER BY updated_at DESC LIMIT 20`,
    connection`SELECT COALESCE(SUM(duration_sec), 0) AS secs, COUNT(*) AS sessions FROM focus_sessions WHERE user_id=${userId} AND start_at >= ${start} AND start_at < ${today.toISOString()}`,
  ])) as unknown as [DigestInput["notes"], DigestInput["tasks"], { secs: number | null; sessions: number | null }[]];
  const f = focus[0] as { secs: number | null; sessions: number | null };
  return { dateStr, notes, tasks, focusSecs: Number(f?.secs ?? 0), focusSessions: Number(f?.sessions ?? 0) };
}

export function buildDigestPrompt(input: DigestInput): string {
  return `Write a warm, practical daily digest for ${input.dateStr} covering YESTERDAY (focusing on what was done on ${input.dateStr}).

Notes touched:
${input.notes.map((n) => `- ${n.title}`).join("\n") || "- none"}

Tasks touched:
${input.tasks.map((t) => `- ${t.title} (${t.done ? "done" : "open"})`).join("\n") || "- none"}

Focus: ${Math.round(input.focusSecs / 60)} minutes across ${input.focusSessions} session(s).

Structure (markdown):
## Yesterday
- 2-3 bullets on progress
## Today
- 3-5 concrete suggested focus items for today, using the user's notes/tasks
Keep it under 200 words. Use the note titles you were given.`;
}
