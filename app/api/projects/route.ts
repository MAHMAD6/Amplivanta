import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  status: z.string().max(40).optional(),
});

export const { GET, POST } = collection({
  delegate: db.project,
  label: "Project",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
});
