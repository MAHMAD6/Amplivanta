import { db } from "@/lib/db";
import { item } from "@/lib/crud";
import { hashtagSetSchema } from "@/lib/social/schemas";

export const { GET, PATCH, DELETE } = item({ delegate: db.hashtagSet, label: "Hashtag group", createSchema: hashtagSetSchema, updateSchema: hashtagSetSchema.partial(), deleteRole: "EDITOR" });
