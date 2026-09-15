import { db } from "@/lib/db";
import { item } from "@/lib/crud";
import { mentionSchema } from "@/lib/social/schemas";

export const { GET, PATCH, DELETE } = item({ delegate: db.mentionReference, label: "Mention reference", createSchema: mentionSchema, updateSchema: mentionSchema.partial(), deleteRole: "EDITOR" });
