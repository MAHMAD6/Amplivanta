import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  isSystem: z.boolean().optional(),
});

export const { GET, POST } = collection({
  delegate: db.workspaceRole,
  label: "Role",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "name",
  include: { _count: { select: { permissions: true } } },
  writeRole: "ADMIN",
});
