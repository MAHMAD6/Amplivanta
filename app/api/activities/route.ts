import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "other"]),
  subject: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export const { GET, POST } = collection({
  delegate: db.activity,
  label: "Activity",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "subject",
});
