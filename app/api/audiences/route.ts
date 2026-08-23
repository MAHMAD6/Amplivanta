import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  criteria: z.any().optional(),
  sizeEstimate: z.number().int().min(0).optional(),
});

export const { GET, POST } = collection({
  delegate: db.audience,
  label: "Audience",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "name",
});
