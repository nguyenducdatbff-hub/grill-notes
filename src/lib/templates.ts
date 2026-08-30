import { z } from "zod";

export const TemplateSchema = z.object({
  name: z.string().min(1).max(100),
  body: z.string().max(1_000_000).default(""),
});
