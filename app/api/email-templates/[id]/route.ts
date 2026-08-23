import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  subject: z.string().max(200).nullable().optional(),
  content: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.emailTemplate,
  label: "Email template",
  createSchema: updateSchema,
  updateSchema,
});
