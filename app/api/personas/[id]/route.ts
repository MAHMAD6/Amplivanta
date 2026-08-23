import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  role: z.string().max(120).nullable().optional(),
  demographics: z.any().optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.persona,
  label: "Persona",
  createSchema: updateSchema,
  updateSchema,
});
