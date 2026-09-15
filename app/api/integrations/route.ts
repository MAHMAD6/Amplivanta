import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route } from "@/lib/tenant";
import { integrationView } from "@/lib/server/integration-view";

// GET /api/integrations — this workspace's connections, without secrets.
// Connections are created only by the OAuth callback, never by a client POST.
export const GET = route(async (ctx) => {
  const rows = await db.integration.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ items: rows.map(integrationView) });
});
