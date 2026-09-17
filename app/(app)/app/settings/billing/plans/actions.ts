"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { PLAN_DIMENSIONS, parseLimit } from "@/lib/plan-config";

/**
 * Plan configuration is platform data shared by every workspace, so only a
 * platform super admin may change it. The monthly price is tied to the Stripe
 * price and is not edited here; this sets the annual price, badges, ordering
 * and entitlement limits.
 */

type Result = { ok: true; message: string } | { ok: false; error: string };

export async function configurePlan(fd: FormData): Promise<Result> {
  let ctx;
  try {
    ctx = await getSessionContext();
  } catch {
    return { ok: false, error: "Sign in to configure plans." };
  }
  if (ctx.role !== "SUPER_ADMIN") return { ok: false, error: "Only platform super admins can configure plans." };

  const id = String(fd.get("planId") ?? "");
  const plan = await db.plan.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!plan) return { ok: false, error: "That plan no longer exists." };

  const money = (k: string): number | null | "invalid" => {
    const v = String(fd.get(k) ?? "").trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : "invalid";
  };
  const annualPrice = money("annualPrice");
  if (annualPrice === "invalid") return { ok: false, error: "Enter a valid annual price, or leave it blank." };
  const sortOrder = Number(fd.get("sortOrder") ?? 0);
  if (!Number.isInteger(sortOrder) || Math.abs(sortOrder) > 1000) return { ok: false, error: "Display order must be a whole number." };

  const limits = PLAN_DIMENSIONS.map((d) => ({ key: d.key, label: d.label, parsed: parseLimit(String(fd.get(`limit.${d.key}`) ?? "")) }));
  const bad = limits.find((l) => l.parsed.action === "invalid");
  if (bad) return { ok: false, error: `${bad.label}: enter a whole number, "unlimited", "none", or leave blank.` };

  const recommended = fd.get("recommended") === "on";
  await db.$transaction(async (tx) => {
    // One recommended plan at most, so the badge stays meaningful.
    if (recommended) await tx.plan.updateMany({ where: { id: { not: plan.id } }, data: { recommended: false } });
    await tx.plan.update({ where: { id: plan.id }, data: { annualPrice, recommended, contactSales: fd.get("contactSales") === "on", sortOrder } });
    for (const l of limits) {
      if (l.parsed.action === "remove") await tx.featureEntitlement.deleteMany({ where: { planId: plan.id, featureKey: l.key } });
      else if (l.parsed.action === "set") {
        const data = { enabled: l.parsed.enabled, limitValue: l.parsed.limitValue };
        await tx.featureEntitlement.upsert({ where: { planId_featureKey: { planId: plan.id, featureKey: l.key } }, create: { planId: plan.id, featureKey: l.key, ...data }, update: data });
      }
    }
  });
  await db.platformAuditLog.create({ data: { actorUserId: ctx.userId, action: "plan.configured", resourceType: "Plan", resourceId: plan.id, metadata: { annualPrice, recommended, sortOrder } } }).catch(() => null);
  revalidatePath("/app/settings/billing", "layout");
  return { ok: true, message: `${plan.name} configuration saved` };
}
