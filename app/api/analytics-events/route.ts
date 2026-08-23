import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams } from "@/lib/tenant";

// GET /api/analytics-events — event definitions + recent daily aggregates.
export const GET = route(async (ctx, req) => {
  const { take, skip, page } = listParams(req);
  const where = { workspaceId: ctx.workspaceId };
  const [definitions, aggregates, total] = await Promise.all([
    db.eventDefinition.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.dailyEventAggregate.findMany({ where, orderBy: { date: "desc" }, take: 90 }),
    db.eventDefinition.count({ where }),
  ]);
  return NextResponse.json({ definitions, aggregates, total, page, pageSize: take });
});

const trackSchema = z.object({
  name: z.string().min(1).max(120),
  properties: z.any().optional(),
});

// POST /api/analytics-events — record an event (upserts the daily aggregate).
export const POST = route(async (ctx, req) => {
  const { name, properties } = await parseBody(req, trackSchema);
  const def = await db.eventDefinition.findFirst({ where: { workspaceId: ctx.workspaceId, name } });
  if (!def) {
    await db.eventDefinition.create({ data: { workspaceId: ctx.workspaceId, name, properties } });
  }
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  await db.dailyEventAggregate.upsert({
    where: { workspaceId_eventName_date: { workspaceId: ctx.workspaceId, eventName: name, date: day } },
    update: { count: { increment: 1 } },
    create: { workspaceId: ctx.workspaceId, eventName: name, date: day, count: 1 },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
});
