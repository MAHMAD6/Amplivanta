import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  subject: z.string().min(1).max(200),
  content: z.string().default(""),
  previewText: z.string().max(200).optional(),
  fromName: z.string().max(120).optional(),
  fromEmail: z.string().email().optional(),
  templateId: z.string().optional(),
  status: z.string().max(40).optional(),
  scheduledAt: z.coerce.date().optional(),
});

export const { GET, POST } = collection({
  delegate: db.emailCampaign,
  label: "Email campaign",
  createSchema,
  updateSchema: createSchema.partial(),
  searchField: "name",
  include: { _count: { select: { sends: true } } },
});
