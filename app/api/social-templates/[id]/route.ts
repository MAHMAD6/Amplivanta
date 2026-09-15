import { db } from "@/lib/db";
import { item } from "@/lib/crud";
import { socialTemplateSchema } from "@/lib/social/schemas";

export const { GET, PATCH, DELETE } = item({ delegate: db.socialTemplate, label: "Template", createSchema: socialTemplateSchema, updateSchema: socialTemplateSchema.partial(), deleteRole: "EDITOR" });
