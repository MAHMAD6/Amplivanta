import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  fields: z.any().optional(),
  submitButtonText: z.string().max(80).optional(),
  successMessage: z.string().max(200).optional(),
  redirectUrl: z.string().max(300).nullable().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.form,
  label: "Form",
  createSchema: updateSchema,
  updateSchema,
  include: { submissions: { orderBy: { createdAt: "desc" }, take: 25 } },
});
