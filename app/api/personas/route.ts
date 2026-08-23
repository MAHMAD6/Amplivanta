import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  role: z.string().max(120).optional(),
  demographics: z.any().optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});

export const { GET, POST } = collection({
  delegate: db.persona,
  label: "Persona",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
});
