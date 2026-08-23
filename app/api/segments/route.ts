import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  // `filterCriteria` is a required Json column.
  filterCriteria: z.any().default({}),
  memberCount: z.number().int().min(0).optional(),
});

export const { GET, POST } = collection({
  delegate: db.segment,
  label: "Segment",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
});
