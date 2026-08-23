import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  subject: z.string().max(200).optional(),
  content: z.string().default(""),
  isDefault: z.boolean().optional(),
});

export const { GET, POST } = collection({
  delegate: db.emailTemplate,
  label: "Email template",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
});
