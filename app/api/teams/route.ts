import { z } from "zod";
import { db } from "@/lib/db";
import { collection } from "@/lib/crud";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  parentTeamId: z.string().optional(),
});

export const { GET, POST } = collection({
  delegate: db.team,
  label: "Team",
  createSchema: schema,
  updateSchema: schema.partial(),
  searchField: "name",
  include: { _count: { select: { members: true } } },
  writeRole: "ADMIN",
});
