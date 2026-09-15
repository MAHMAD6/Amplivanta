import { z } from "zod";
import { db } from "@/lib/db";
import { item } from "@/lib/crud";

const schema = z.object({ name: z.string().min(1).max(160).optional() });

export const { GET, PATCH, DELETE } = item({ delegate: db.report, label: "Report", createSchema: schema, updateSchema: schema, deleteRole: "EDITOR" });
