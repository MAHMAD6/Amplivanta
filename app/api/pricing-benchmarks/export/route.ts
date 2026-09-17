import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, ApiError } from "@/lib/tenant";
import { BENCHMARK_ROLES, csvCell } from "@/lib/pricing-benchmark";

// GET /api/pricing-benchmarks/export?set=&currency=&asOf= — CSV of the filtered benchmark dataset.
export const GET = route(async (ctx, req) => {
  if (!BENCHMARK_ROLES.includes(ctx.role)) throw new ApiError(403, "Pricing benchmarks are limited to authorized internal roles.");
  const url = new URL(req.url);
  const set = url.searchParams.get("set") || undefined;
  const currency = url.searchParams.get("currency") || undefined;
  const asOf = url.searchParams.get("asOf");
  const asOfDate = asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf) ? new Date(`${asOf}T23:59:59Z`) : null;
  const rows = await db.pricingBenchmark.findMany({
    where: { ...(set ? { benchmarkSet: set } : {}), ...(currency ? { currency } : {}), ...(asOfDate ? { OR: [{ effectiveDate: null }, { effectiveDate: { lte: asOfDate } }] } : {}) },
    orderBy: [{ competitor: "asc" }, { price: "asc" }],
    take: 5000,
  });
  const header = ["Benchmark set", "Source", "Plan / Tier", "Price", "Currency", "Interval", "Value dimensions", "Effective date", "Source URL", "Notes", "Captured", "Updated"];
  const lines = [header, ...rows.map((r) => [r.benchmarkSet, r.competitor, r.planName, r.price, r.currency, r.interval, r.dimensions, r.effectiveDate?.toISOString().slice(0, 10), r.sourceUrl, r.notes, r.capturedAt.toISOString(), r.updatedAt.toISOString()])].map((l) => l.map(csvCell).join(","));
  await db.platformAuditLog.create({ data: { actorUserId: ctx.userId, action: "pricing_benchmark.exported", resourceType: "PricingBenchmark", metadata: { rows: rows.length, set, currency, asOf } } }).catch(() => null);
  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="pricing-benchmarks-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
});
