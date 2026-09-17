"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { BENCHMARK_INTERVALS, BENCHMARK_ROLES } from "@/lib/pricing-benchmark";

/**
 * Internal pricing benchmarks are platform-wide records. Only the roles that
 * can open the screen may write, and every change is kept in the platform
 * audit log so source attribution and update history survive edits.
 */

type Result = { ok: true; message: string } | { ok: false; error: string };

async function authorized() {
  try {
    const c = await getSessionContext();
    return BENCHMARK_ROLES.includes(c.role) ? c : null;
  } catch {
    return null;
  }
}

const denied = { ok: false as const, error: "Pricing benchmarks are limited to authorized internal roles." };
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/app/pricing-benchmark");

function parse(fd: FormData) {
  const competitor = str(fd, "competitor", 120);
  const planName = str(fd, "planName", 120);
  const price = Number(str(fd, "price", 20));
  const currency = str(fd, "currency", 3).toUpperCase() || "USD";
  const interval = str(fd, "interval", 20) || "month";
  const set = str(fd, "benchmarkSet", 80) || "Default";
  const sourceUrl = str(fd, "sourceUrl", 500);
  const eff = str(fd, "effectiveDate", 20);
  const effectiveDate = eff ? new Date(`${eff}T00:00:00Z`) : null;
  if (!competitor || !planName) return { error: "Enter the benchmark source and the plan or tier." };
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) return { error: "Enter a price of 0 or more." };
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Currency must be a three-letter code such as USD." };
  if (!BENCHMARK_INTERVALS.some(([v]) => v === interval)) return { error: "Choose a billing interval." };
  if (effectiveDate && Number.isNaN(effectiveDate.getTime())) return { error: "Enter a valid effective date." };
  if (sourceUrl && !/^https?:\/\/[^\s]+$/i.test(sourceUrl)) return { error: "The source link must start with http:// or https://." };
  if (!sourceUrl && !str(fd, "notes")) return { error: "Add a source link or a note describing where this price came from." };
  return {
    data: {
      competitor,
      planName,
      price: Math.round(price * 100) / 100,
      currency,
      interval,
      benchmarkSet: set,
      sourceUrl: sourceUrl || null,
      effectiveDate,
      dimensions: str(fd, "dimensions", 300) || null,
      notes: str(fd, "notes", 2000) || null,
    },
  };
}

async function log(userId: string, action: string, id: string | null, metadata: Record<string, unknown>) {
  await db.platformAuditLog.create({ data: { actorUserId: userId, action, resourceType: "PricingBenchmark", resourceId: id, metadata: metadata as never } }).catch(() => null);
}

export async function addBenchmark(fd: FormData): Promise<Result> {
  const c = await authorized();
  if (!c) return denied;
  const v = parse(fd);
  if ("error" in v) return { ok: false, error: v.error! };
  const row = await db.pricingBenchmark.create({ data: { ...v.data, createdById: c.userId } });
  await log(c.userId, "pricing_benchmark.created", row.id, { competitor: row.competitor, planName: row.planName, price: row.price, currency: row.currency });
  refresh();
  return { ok: true, message: "Benchmark added" };
}

export async function updateBenchmark(fd: FormData): Promise<Result> {
  const c = await authorized();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const before = await db.pricingBenchmark.findUnique({ where: { id } });
  if (!before) return { ok: false, error: "That benchmark no longer exists." };
  const v = parse(fd);
  if ("error" in v) return { ok: false, error: v.error! };
  await db.pricingBenchmark.update({ where: { id }, data: v.data });
  await log(c.userId, "pricing_benchmark.updated", id, { before: { price: before.price, currency: before.currency, interval: before.interval, sourceUrl: before.sourceUrl }, after: { price: v.data.price, currency: v.data.currency, interval: v.data.interval, sourceUrl: v.data.sourceUrl } });
  refresh();
  return { ok: true, message: "Benchmark updated" };
}

export async function deleteBenchmark(id: string): Promise<Result> {
  const c = await authorized();
  if (!c) return denied;
  const row = await db.pricingBenchmark.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "That benchmark no longer exists." };
  await db.pricingBenchmark.delete({ where: { id } });
  await log(c.userId, "pricing_benchmark.deleted", id, { competitor: row.competitor, planName: row.planName, price: row.price, currency: row.currency, sourceUrl: row.sourceUrl });
  refresh();
  return { ok: true, message: "Benchmark removed" };
}

export async function saveBenchmarkNotes(fd: FormData): Promise<Result> {
  const c = await authorized();
  if (!c) return denied;
  const name = str(fd, "benchmarkSet", 80) || "Default";
  const assumptions = String(fd.get("assumptions") ?? "").trim().slice(0, 5000);
  await db.pricingBenchmarkSet.upsert({ where: { name }, create: { name, assumptions: assumptions || null, updatedById: c.userId }, update: { assumptions: assumptions || null, updatedById: c.userId } });
  await log(c.userId, "pricing_benchmark.notes_saved", null, { benchmarkSet: name, length: assumptions.length });
  refresh();
  return { ok: true, message: "Notes saved" };
}
