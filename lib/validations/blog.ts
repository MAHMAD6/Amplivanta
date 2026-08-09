import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(5, "Excerpt is required"),
  content: z.string().min(5, "Content is required"),
  coverImage: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1, "Author is required"),
  authorImage: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type BlogInput = z.infer<typeof blogSchema>;
