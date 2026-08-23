import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  isPublished: z.boolean().optional(),
});

export const { GET, PATCH, DELETE } = item({
  delegate: db.landingPage,
  label: "Landing page",
  createSchema: updateSchema,
  updateSchema,
  include: { versions: { orderBy: { version: "desc" }, take: 10 } },
});
