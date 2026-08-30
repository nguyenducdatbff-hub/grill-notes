import { z } from "zod";

export const NotePatchSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().max(1_000_000).optional(),
}).refine((v) => v.title !== undefined || v.body !== undefined, { message: "nothing to update" });

export const NoteCreateSchema = z.object({
  title: z.string().max(200).default("Untitled"),
  body: z.string().max(1_000_000).default(""),
});
