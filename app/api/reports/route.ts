import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  type: z.enum(["pipeline", "contacts", "deals", "activities", "tasks", "traffic", "campaigns"]),
  // `config` is a Json column describing the report definition.
  config: z.any().default({}),
});

export const { GET, POST } = collection({
  delegate: db.report,
  label: "Report",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
});
