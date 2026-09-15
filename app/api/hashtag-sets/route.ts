import { db } from "@/lib/db";
import { collection } from "@/lib/crud";
import { hashtagSetSchema } from "@/lib/social/schemas";

export const { GET, POST } = collection({ delegate: db.hashtagSet, label: "Hashtag group", createSchema: hashtagSetSchema, updateSchema: hashtagSetSchema.partial(), searchField: "name", orderBy: { name: "asc" } });
