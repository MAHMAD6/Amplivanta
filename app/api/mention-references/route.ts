import { db } from "@/lib/db";
import { collection } from "@/lib/crud";
import { mentionSchema } from "@/lib/social/schemas";

export const { GET, POST } = collection({ delegate: db.mentionReference, label: "Mention reference", createSchema: mentionSchema, updateSchema: mentionSchema.partial(), searchField: "label", orderBy: { label: "asc" } });
