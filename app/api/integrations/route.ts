import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  provider: z.string().min(1).max(80),
  status: z.string().max(40).optional(),
  scopes: z.array(z.string()).optional(),
  config: z.any().optional(),
});

export const { GET, POST } = collection({
  delegate: db.integration,
  label: "Integration",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "provider",
});
