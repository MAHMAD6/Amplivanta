import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const schema = z.object({
  status: z.string().max(40).optional(),
  scopes: z.array(z.string()).optional(),
  config: z.any().optional(),
  lastSyncAt: z.coerce.date().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.integration,
  label: "Integration",
  createSchema: schema,
  updateSchema: schema,
});
