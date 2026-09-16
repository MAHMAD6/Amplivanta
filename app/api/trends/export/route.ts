import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route } from "@/lib/tenant";
import { csvCell } from "@/lib/audit-filters";

// GET /api/trends/export — CSV of tracked topics matching the page filters.
export const GET = route(async (ctx, req) => {
  const p = new URL(req.url).searchParams;
  const days = Number(p.get("days"));
  const rows = await db.trend.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      ...(p.get("q") ? { topic: { contains: p.get("q")!, mode: "insensitive" as const } } : {}),
      ...(p.get("source") ? { source: p.get("source")! } : {}),
      ...(p.get("category") ? { category: p.get("category")! } : {}),
      ...(p.get("country") ? { country: p.get("country")! } : {}),
      ...([7, 30, 90].includes(days) ? { createdAt: { gte: new Date(Date.now() - days * 86400000) } } : {}),
    },
    orderBy: { growth: "desc" },
    take: 5000,
  });
  const head = ["Topic", "Source", "Industry", "Country", "Mentions", "Engagement", "Velocity %", "Relevance", "Hashtags", "Tracked"];
  const body = rows.map((r) => [r.topic, r.source, r.category, r.country, r.mentions, r.engagement, r.growth, r.relevance, r.hashtags.join(" "), r.createdAt.toISOString()].map((v) => (typeof v === "number" ? String(v) : csvCell(v))).join(","));
  return new NextResponse([head.join(","), ...body].join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="trending-topics.csv"` },
  });
});
