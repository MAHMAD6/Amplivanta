import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  // `fields` is a Json column (array of field defs), not a relation.
  fields: z.any().default([]),
  submitButtonText: z.string().max(80).optional(),
  successMessage: z.string().max(200).optional(),
  redirectUrl: z.string().max(300).optional(),
});

export const { GET, POST } = collection({
  delegate: db.form,
  label: "Form",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
  include: { _count: { select: { submissions: true } } },
});
