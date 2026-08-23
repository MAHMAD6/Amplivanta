import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  previewText: z.string().max(200).nullable().optional(),
  fromName: z.string().max(120).nullable().optional(),
  fromEmail: z.string().email().nullable().optional(),
  templateId: z.string().nullable().optional(),
  status: z.string().max(40).optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.emailCampaign,
  label: "Email campaign",
  createSchema: updateSchema,
  updateSchema,
  include: { template: true },
});
