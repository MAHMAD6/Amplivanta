import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.any().optional(),
  isPublished: z.boolean().optional(),
});

export const { GET, POST } = collection({
  delegate: db.landingPage,
  label: "Landing page",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "title",
});
