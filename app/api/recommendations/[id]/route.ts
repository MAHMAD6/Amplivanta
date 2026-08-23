import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(2000).optional(),
  category: z.string().max(80).optional(),
  impact: z.string().max(20).optional(),
  confidence: z.number().min(0).max(1).optional(),
  status: z.string().max(40).optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.recommendation,
  label: "Recommendation",
  createSchema: schema,
  updateSchema: schema,
});
