import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  metric: z.string().min(1).max(80).optional(),
  status: z.string().max(40).optional(),
  deadline: z.coerce.date().nullable().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.goal,
  label: "Goal",
  createSchema: updateSchema,
  updateSchema,
});
