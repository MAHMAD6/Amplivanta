import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  status: z.string().max(40).optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.strategy,
  label: "Strategy",
  createSchema: schema,
  updateSchema: schema,
  include: { goals: true },
});
