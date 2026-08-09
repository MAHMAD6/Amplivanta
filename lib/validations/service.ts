import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  description: z.string().min(5, "Description is required"),
  longDesc: z.string().min(5, "Long description is required"),
  icon: z.string().min(1, "Icon is required"),
  image: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
