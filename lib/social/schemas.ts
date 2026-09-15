import { z } from "zod";

export const hashtagSetSchema = z.object({
  name: z.string().min(1).max(80),
  tags: z.array(z.string().regex(/^#?[\p{L}\p{N}_]{1,60}$/u, "Hashtags may use letters, numbers and underscores")).min(1).max(30),
  platform: z.string().max(40).optional(),
  category: z.string().max(60).optional(),
  notes: z.string().max(500).optional(),
});

export const mentionSchema = z.object({
  label: z.string().min(1).max(80),
  handle: z.string().regex(/^@?[\w.]{1,60}$/, "Enter a handle such as @amplivanta"),
  platform: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
});

export const socialTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  category: z.enum(["social", "campaign", "approval"]).optional(),
});
