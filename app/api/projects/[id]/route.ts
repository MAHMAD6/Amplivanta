import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.string().max(40).optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.project,
  label: "Project",
  createSchema: updateSchema,
  updateSchema,
});
