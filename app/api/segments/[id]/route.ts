import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(1000).nullable().optional(),
  filterCriteria: z.any().optional(),
  memberCount: z.number().int().min(0).optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.segment,
  label: "Segment",
  createSchema: updateSchema,
  updateSchema,
});
