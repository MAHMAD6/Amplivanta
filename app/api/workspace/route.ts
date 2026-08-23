import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

// GET /api/workspace — the active workspace plus every workspace the user belongs to.
export const GET = route(async (ctx) => {
  const [workspace, memberships] = await Promise.all([
    db.workspace.findUnique({ where: { id: ctx.workspaceId } }),
    db.membership.findMany({
      where: { userId: ctx.userId },
      include: { workspace: { select: { id: true, name: true, slug: true, logo: true, planTier: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return NextResponse.json({
    active: workspace,
    role: ctx.workspaceRole,
    workspaces: memberships.map((m) => ({ ...m.workspace, role: m.role })),
  });
});

const patchSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  logo: z.string().max(500).optional(),
  industry: z.string().max(120).optional(),
  size: z.string().max(60).optional(),
  domain: z.string().max(160).optional(),
});

// PATCH /api/workspace — update the active workspace (owner/admin only).
export const PATCH = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const data = await parseBody(req, patchSchema);
  const workspace = await db.workspace.update({ where: { id: ctx.workspaceId }, data });
  await writeAudit(ctx, "workspace.update", { resourceType: "Workspace", resourceId: ctx.workspaceId });
  return NextResponse.json(workspace);
});
