"use server";

import { revalidatePath } from "next/cache";
import { GrantType, JobStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type GrantResult = { ok: true; id: string } | { ok: false; error: string };

const GRANT_TYPES = new Set<string>(Object.values(GrantType));

/**
 * Grant access or credit to an individual user or an organization.
 *
 * Authorization is enforced here, server-side — hiding the control in the UI is
 * not authorization (handoff rule 7). A reason is mandatory and every grant is
 * written to the immutable platform audit log (rule 11).
 */
export async function grantAccessCredit(formData: FormData): Promise<GrantResult> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "You are not authorized to grant access or credit." };
  }

  const grantType = String(formData.get("grantType") ?? "");
  if (!GRANT_TYPES.has(grantType)) return { ok: false, error: "Select a valid grant type." };

  const target = String(formData.get("target") ?? "user");
  const recipient = String(formData.get("recipient") ?? "").trim();
  if (!recipient) return { ok: false, error: "Choose who this grant applies to." };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { ok: false, error: "A reason is required for this action." };

  const note = String(formData.get("note") ?? "").trim() || null;
  const rawDays = String(formData.get("days") ?? "").trim();
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const rawEffective = String(formData.get("effectiveAt") ?? "").trim();

  const days = rawDays ? Number(rawDays) : null;
  const amount = rawAmount ? Number(rawAmount) : null;
  if (days != null && (!Number.isFinite(days) || days <= 0)) return { ok: false, error: "Number of days must be a positive number." };
  if (amount != null && (!Number.isFinite(amount) || amount <= 0)) return { ok: false, error: "Amount must be a positive number." };
  if (grantType === GrantType.ACCESS_EXTENSION && days == null) return { ok: false, error: "Enter the number of days to extend access by." };
  if ((grantType === GrantType.USAGE_CREDIT || grantType === GrantType.BILLING_CREDIT) && amount == null) {
    return { ok: false, error: "Enter the credit amount." };
  }

  try {
    const grant = await prisma.$transaction(async (tx) => {
      const created = await tx.creditAdjustment.create({
        data: {
          grantType: grantType as GrantType,
          amount,
          days,
          userId: target === "user" ? recipient : null,
          organizationId: target === "organization" ? recipient : null,
          reason,
          note,
          grantedByUserId: user.id ?? user.email ?? null,
          effectiveAt: rawEffective ? new Date(rawEffective) : new Date(),
        },
      });

      await tx.platformAuditLog.create({
        data: {
          actorUserId: user.id ?? user.email ?? null,
          action: "grant.access_credit",
          resourceType: "CreditAdjustment",
          resourceId: created.id,
          scopeLevel: target === "organization" ? "ORGANIZATION" : "GLOBAL",
          reason,
          metadata: { grantType, amount, days, target, recipient },
        },
      });

      return created;
    });

    revalidatePath("/super/quick-actions/grant-access-credit");
    revalidatePath("/super/subscriptions-billing/ai-credit-management");
    return { ok: true, id: grant.id };
  } catch {
    return { ok: false, error: "Could not record the grant. The platform database was unreachable." };
  }
}

/* ------------------------------------------------------------- diagnostics */

async function requireSuperAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") return null;
  return user;
}

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * Runs real diagnostics and writes SystemHealthCheck rows.
 * This is the producer behind the System Health screen — the table is populated
 * by measured probes, never by seeded sample values.
 */
export async function runSystemHealthCheck(): Promise<ActionResult> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to run diagnostics." };

  const checks: { service: string; status: string; latencyMs: number | null; message: string | null }[] = [];

  const probe = async (service: string, fn: () => Promise<unknown>) => {
    const started = Date.now();
    try {
      await fn();
      checks.push({ service, status: "operational", latencyMs: Date.now() - started, message: null });
    } catch (e) {
      checks.push({
        service,
        status: "degraded",
        latencyMs: Date.now() - started,
        message: e instanceof Error ? e.message.split("\n")[0].slice(0, 200) : "Unknown error",
      });
    }
  };

  await probe("database", () => prisma.$queryRaw`SELECT 1`);
  await probe("user directory", () => prisma.user.count());
  await probe("billing records", () => prisma.subscription.count());
  await probe("audit log", () => prisma.platformAuditLog.count());

  try {
    await prisma.systemHealthCheck.createMany({ data: checks });
    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id ?? null,
        action: "system.health_check",
        resourceType: "SystemHealthCheck",
        metadata: { services: checks.length },
      },
    });
  } catch {
    return { ok: false, error: "Diagnostics ran but results could not be saved — the database is unreachable." };
  }

  revalidatePath("/super/system-management/system-health");
  revalidatePath("/super/quick-actions/system-health-check");
  const degraded = checks.filter((c) => c.status !== "operational").length;
  return {
    ok: true,
    message: degraded
      ? `${checks.length} services checked, ${degraded} degraded.`
      : `${checks.length} services checked, all operational.`,
  };
}

/* ------------------------------------------------------------------ careers */

export async function createJobOpening(formData: FormData): Promise<ActionResult> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to publish job openings." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "A job title is required." };

  const slug =
    String(formData.get("slug") ?? "").trim() ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const status = String(formData.get("status") ?? "DRAFT") as JobStatus;
  if (!Object.values(JobStatus).includes(status)) return { ok: false, error: "Select a valid status." };

  try {
    const job = await prisma.jobOpening.create({
      data: {
        title,
        slug,
        department: String(formData.get("department") ?? "").trim() || null,
        location: String(formData.get("location") ?? "").trim() || null,
        employment: String(formData.get("employment") ?? "").trim() || null,
        description: String(formData.get("description") ?? "").trim() || null,
        status,
        publishedAt: status === JobStatus.OPEN ? new Date() : null,
      },
    });
    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id ?? null,
        action: "content.job_opening_created",
        resourceType: "JobOpening",
        resourceId: job.id,
        metadata: { title, status },
      },
    });
    revalidatePath("/super/content-management/careers-job-openings");
    return { ok: true, message: `"${title}" created.` };
  } catch (e) {
    const dup = e instanceof Error && e.message.includes("Unique constraint");
    return { ok: false, error: dup ? "A job opening with that slug already exists." : "Could not save the job opening." };
  }
}

/* ------------------------------------------------------------------- import */

const IMPORTABLE = {
  "security-and-compliance-suppression-lists": {
    label: "suppression entries",
    headers: ["email", "reason", "source"],
    model: "suppressionEntry",
    create: (row: Record<string, string>) =>
      row.email ? { email: row.email, reason: row.reason || "imported", source: row.source || "csv-import" } : null,
  },
  "plans-and-pricing-pricing-benchmark-and-positioning": {
    label: "pricing benchmarks",
    headers: ["competitor", "planName", "price", "currency", "interval", "sourceUrl"],
    model: "pricingBenchmark",
    create: (row: Record<string, string>) => {
      const price = Number(row.price);
      if (!row.competitor || !row.planName || !Number.isFinite(price)) return null;
      return {
        competitor: row.competitor,
        planName: row.planName,
        price,
        currency: row.currency || "USD",
        interval: row.interval || "month",
        sourceUrl: row.sourceUrl || null,
      };
    },
  },
} as const;

export async function importableHeaders(key: string): Promise<string[] | null> {
  return key in IMPORTABLE ? [...IMPORTABLE[key as keyof typeof IMPORTABLE].headers] : null;
}

/** Minimal RFC 4180 parser — handles quoted fields and embedded commas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/**
 * CSV import, limited to additive reference data (suppression list, pricing
 * benchmarks). Deliberately not offered for governance or billing records,
 * which must originate from their own systems of record.
 */
export async function importCsv(key: string, formData: FormData): Promise<ActionResult> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to import data." };

  const spec = IMPORTABLE[key as keyof typeof IMPORTABLE];
  if (!spec) return { ok: false, error: "Import is not available for this screen." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a CSV file to import." };
  if (file.size > 2_000_000) return { ok: false, error: "File is larger than the 2 MB import limit." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { ok: false, error: "The file has no data rows." };

  const header = rows[0].map((h) => h.trim());
  const records: Record<string, unknown>[] = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    const rec = spec.create(obj);
    if (rec) records.push(rec as Record<string, unknown>);
    else skipped++;
  }
  if (!records.length) {
    return { ok: false, error: `No valid rows found. Expected headers: ${spec.headers.join(", ")}.` };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (prisma as any)[spec.model].createMany({ data: records, skipDuplicates: true });
    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id ?? null,
        action: "import.csv",
        resourceType: spec.model,
        metadata: { imported: created.count, skipped, file: file.name },
      },
    });
    revalidatePath("/super");
    return {
      ok: true,
      message: `Imported ${created.count} ${spec.label}${skipped ? `, skipped ${skipped} invalid row(s)` : ""}.`,
    };
  } catch {
    return { ok: false, error: "Import failed — the database was unreachable." };
  }
}
