import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(160),
  type: z.string().min(1).max(60),
  budget: z.number().min(0).optional(),
});

export const { GET, POST } = collection({
  delegate: db.channel,
  label: "Channel",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "name",
});
