import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type TeamInput = z.infer<typeof teamSchema>;
