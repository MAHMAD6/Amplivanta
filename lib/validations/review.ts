import { z } from "zod";

export const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  content: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().int().min(1).max(5),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
