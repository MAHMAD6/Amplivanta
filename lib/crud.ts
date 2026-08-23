import { NextResponse } from "next/server";
import type { z } from "zod";
import { route, parseBody, listParams, requireRole, ApiError, type SessionContext } from "@/lib/tenant";
import type { Role } from "@prisma/client";

/**
 * Prisma model delegate — the subset of methods a workspace-scoped resource needs.
 * Typed loosely on purpose so one factory serves every domain table.
 */
interface Delegate {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
  create: (args: any) => Promise<any>;
  findFirst: (args?: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

interface CrudConfig {
  delegate: Delegate;
  /** Human name used in 404 messages. */
  label: string;
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  /** Field to `contains`-search on `?q=`. */
  searchField?: string;
  /** Prisma include for reads. */
  include?: unknown;
  /** Minimum workspace role to create/update. Default EDITOR. */
  writeRole?: Role;
  /** Minimum workspace role to delete. Default ADMIN. */
  deleteRole?: Role;
  orderBy?: unknown;
}

/** Builds `{ GET, POST }` for a collection route. */
export function collection(cfg: CrudConfig) {
  const GET = route(async (ctx, req) => {
    const { take, skip, page, q } = listParams(req);
    const where: Record<string, unknown> = { workspaceId: ctx.workspaceId };
    if (q && cfg.searchField) where[cfg.searchField] = { contains: q, mode: "insensitive" };
    const [items, total] = await Promise.all([
      cfg.delegate.findMany({ where, include: cfg.include, orderBy: cfg.orderBy ?? { createdAt: "desc" }, take, skip }),
      cfg.delegate.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, pageSize: take });
  });

  const POST = route(async (ctx, req) => {
    requireRole(ctx, cfg.writeRole ?? "EDITOR");
    const data = (await parseBody(req, cfg.createSchema as never)) as Record<string, unknown>;
    const created = await cfg.delegate.create({ data: { ...data, workspaceId: ctx.workspaceId } });
    return NextResponse.json(created, { status: 201 });
  });

  return { GET, POST };
}

/** Builds `{ GET, PATCH, DELETE }` for an item route. */
export function item(cfg: CrudConfig) {
  async function loadOwned(ctx: SessionContext, id: string) {
    const found = await cfg.delegate.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
    if (!found) throw new ApiError(404, `${cfg.label} not found`);
    return found;
  }

  const GET = route<{ id: string }>(async (ctx, _req, { id }) => {
    await loadOwned(ctx, id);
    const record = await cfg.delegate.findFirst({ where: { id, workspaceId: ctx.workspaceId }, include: cfg.include });
    return NextResponse.json(record);
  });

  const PATCH = route<{ id: string }>(async (ctx, req, { id }) => {
    requireRole(ctx, cfg.writeRole ?? "EDITOR");
    await loadOwned(ctx, id);
    const data = (await parseBody(req, cfg.updateSchema as never)) as Record<string, unknown>;
    const updated = await cfg.delegate.update({ where: { id }, data });
    return NextResponse.json(updated);
  });

  const DELETE = route<{ id: string }>(async (ctx, _req, { id }) => {
    requireRole(ctx, cfg.deleteRole ?? "ADMIN");
    await loadOwned(ctx, id);
    await cfg.delegate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });

  return { GET, PATCH, DELETE };
}
