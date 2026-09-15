import { db } from "@/lib/db";
import { collection } from "@/lib/crud";
import { socialTemplateSchema } from "@/lib/social/schemas";

export const { GET, POST } = collection({ delegate: db.socialTemplate, label: "Template", createSchema: socialTemplateSchema, updateSchema: socialTemplateSchema.partial(), searchField: "name" });
