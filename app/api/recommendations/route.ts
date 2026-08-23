import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  // `category` is required on the model (no default).
  category: z.string().min(1).max(80).default("growth"),
  impact: z.string().max(20).optional(),
  effort: z.string().max(20).optional(),
  confidence: z.number().min(0).max(1).optional(),
  status: z.string().max(40).optional(),
});

export const { GET, POST } = collection({
  delegate: db.recommendation,
  label: "Recommendation",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "title",
});
