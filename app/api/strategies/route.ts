import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  status: z.string().max(40).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const { GET, POST } = collection({
  delegate: db.strategy,
  label: "Strategy",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "name",
});
