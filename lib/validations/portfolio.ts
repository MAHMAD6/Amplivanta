import { z } from "zod";

export const portfolioSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  client: z.string().min(1, "Client is required"),
  description: z.string().min(5, "Description is required"),
  longDesc: z.string().min(5, "Long description is required"),
  coverImage: z.string().default(""),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  results: z
    .array(z.object({ metric: z.string(), value: z.string() }))
    .default([]),
  serviceId: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
