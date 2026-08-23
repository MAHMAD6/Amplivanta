import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  targetValue: z.number(),
  currentValue: z.number().optional(),
  metric: z.string().min(1).max(80),
  status: z.string().max(40).optional(),
  deadline: z.coerce.date().optional(),
  strategyId: z.string().optional(),
});

export const { GET, POST } = collection({
  delegate: db.goal,
  label: "Goal",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "title",
});
