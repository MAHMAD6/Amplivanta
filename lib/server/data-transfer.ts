import "server-only";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { IMPORT_LIMITS, checkMapping, parseCsv, toCsv, validateRow, type ImportEntity } from "@/lib/data-transfer";

type Ctx = { workspaceId: string; userId: string };

export type ImportOptions = { entity: ImportEntity; text: string; fileName: string; mapping: (string | null)[]; duplicates: "skip" | "update" };

export function readRows(text: string) {
  const rows = parseCsv(text);
  const [headers = [], ...body] = rows;
  return { headers: headers.map((h) => h.trim()), body };
}

/**
 * Runs an import synchronously (files are capped at 10,000 rows) and records a
 * DataTransferJob. Invalid rows are skipped and reported, never half-written.
 */
export async function runImport(c: Ctx, o: ImportOptions) {
  const { headers, body } = readRows(o.text);
  const bad = checkMapping(o.entity, headers, o.mapping);
  if (bad) throw new Error(bad);
  if (body.length === 0) throw new Error("The file has no data rows.");
  if (body.length > IMPORT_LIMITS.rows) throw new Error(`Files are limited to ${IMPORT_LIMITS.rows.toLocaleString("en-US")} rows.`);

  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let updated = 0;
  let alreadyExisting = 0;
  let invalid = 0;
  const w = c.workspaceId;
  const fail = (row: number, message: string) => {
    invalid++;
    if (errors.length < IMPORT_LIMITS.storedErrors) errors.push({ row, message });
  };

  // Lookups loaded once so a 10k-row file does not issue 10k extra queries.
  const stages = o.entity === "deals" ? await db.stage.findMany({ where: { workspaceId: w }, select: { id: true, name: true, pipelineId: true, pipeline: { select: { isDefault: true } } } }) : [];
  const stageByName = new Map<string, { id: string; pipelineId: string }>();
  for (const s of [...stages].sort((a, b) => Number(b.pipeline.isDefault) - Number(a.pipeline.isDefault))) {
    const k = s.name.toLowerCase();
    if (!stageByName.has(k)) stageByName.set(k, { id: s.id, pipelineId: s.pipelineId });
  }
  const companyIds = new Map<string, string>();
  const companyId = async (name: unknown) => {
    const n = typeof name === "string" ? name.trim() : "";
    if (!n) return null;
    const key = n.toLowerCase();
    if (companyIds.has(key)) return companyIds.get(key)!;
    const found = await db.company.findFirst({ where: { workspaceId: w, name: { equals: n, mode: "insensitive" } }, select: { id: true } });
    if (found) companyIds.set(key, found.id);
    return found?.id ?? null;
  };
  const seen = new Set<string>();

  for (const [i, cells] of body.entries()) {
    const rowNo = i + 2; // header is row 1
    const r = validateRow(o.entity, cells, o.mapping);
    if (!r.ok) {
      fail(rowNo, r.message);
      continue;
    }
    const d = r.data;
    try {
      if (o.entity === "contacts") {
        const email = (d.email as string | undefined) ?? null;
        if (email && seen.has(email)) {
          fail(rowNo, `Duplicate of an earlier row (${email})`);
          continue;
        }
        if (email) seen.add(email);
        const fields = {
          email,
          name: (d.name as string) ?? null,
          firstName: (d.firstName as string) ?? null,
          lastName: (d.lastName as string) ?? null,
          phone: (d.phone as string) ?? null,
          jobTitle: (d.jobTitle as string) ?? null,
          companyName: (d.companyName as string) ?? null,
          companyId: await companyId(d.companyName),
          ...(d.status ? { status: d.status as string } : {}),
        };
        const existing = email ? await db.contact.findFirst({ where: { workspaceId: w, email: { equals: email, mode: "insensitive" } }, select: { id: true, tags: true } }) : null;
        if (existing) {
          if (o.duplicates === "skip") {
            alreadyExisting++;
            continue;
          }
          const patch = Object.fromEntries(Object.entries(fields).filter(([, v]) => v != null));
          await db.contact.update({ where: { id: existing.id }, data: { ...patch, ...(d.tags ? { tags: [...new Set([...existing.tags, ...(d.tags as string[])])] } : {}) } });
          updated++;
        } else {
          await db.contact.create({ data: { workspaceId: w, ...fields, tags: (d.tags as string[]) ?? [] } });
          created++;
        }
      } else if (o.entity === "companies") {
        const name = d.name as string;
        const domain = (d.domain as string | undefined) ?? null;
        const key = domain || name.toLowerCase();
        if (seen.has(key)) {
          fail(rowNo, `Duplicate of an earlier row (${domain || name})`);
          continue;
        }
        seen.add(key);
        const fields = { name, domain, website: (d.website as string) ?? null, industry: (d.industry as string) ?? null, size: (d.size as string) ?? null, location: (d.location as string) ?? null };
        const existing = await db.company.findFirst({ where: { workspaceId: w, ...(domain ? { domain } : { name: { equals: name, mode: "insensitive" } }) }, select: { id: true } });
        if (existing) {
          if (o.duplicates === "skip") {
            alreadyExisting++;
            continue;
          }
          await db.company.update({ where: { id: existing.id }, data: Object.fromEntries(Object.entries(fields).filter(([, v]) => v != null)) });
          updated++;
        } else {
          const row = await db.company.create({ data: { workspaceId: w, ...fields } });
          companyIds.set(name.toLowerCase(), row.id);
          created++;
        }
      } else {
        const stage = d.stage ? stageByName.get(String(d.stage).toLowerCase()) : undefined;
        if (d.stage && !stage) {
          fail(rowNo, `Stage "${String(d.stage).slice(0, 40)}" does not exist in this workspace`);
          continue;
        }
        const contact = d.contactEmail ? await db.contact.findFirst({ where: { workspaceId: w, email: { equals: String(d.contactEmail), mode: "insensitive" } }, select: { id: true } }) : null;
        await db.deal.create({
          data: {
            workspaceId: w,
            name: d.name as string,
            value: (d.value as number) ?? 0,
            currency: (d.currency as string) ?? "USD",
            status: (d.status as string) ?? "open",
            closeDate: (d.closeDate as Date) ?? null,
            stageId: stage?.id ?? null,
            pipelineId: stage?.pipelineId ?? null,
            contactId: contact?.id ?? null,
            companyId: await companyId(d.companyName),
          },
        });
        created++;
      }
    } catch {
      fail(rowNo, "Could not be saved");
    }
  }

  const skipped = alreadyExisting + invalid;
  const errorCount = invalid;
  const status = invalid === body.length ? "failed" : errorCount > 0 ? "completed_with_errors" : "completed";
  const job = await db.dataTransferJob.create({
    data: { workspaceId: w, kind: "import", entity: o.entity, fileName: o.fileName.slice(0, 200), format: "csv", status, totalRows: body.length, createdCount: created, updatedCount: updated, skippedCount: skipped, errorCount, errors: errors as never, options: { duplicates: o.duplicates, mapping: o.mapping } as never, createdById: c.userId, completedAt: new Date() },
  });
  await db.auditLog.create({ data: { workspaceId: w, actorUserId: c.userId, action: `data.import_${o.entity}`, resourceType: "DataTransferJob", resourceId: job.id, metadata: { rows: body.length, created, updated, skipped } } }).catch(() => null);
  if (errorCount > 0 || body.length >= 500) {
    await notify({ workspaceId: w, userId: c.userId, category: "system", severity: status === "failed" ? "critical" : errorCount ? "warning" : "success", title: `Import of ${o.entity} ${status === "failed" ? "failed" : "finished"}`, body: `${created} created, ${updated} updated, ${skipped} skipped from ${o.fileName}.`, link: `/app/integrations/import-export?job=${job.id}`, resourceType: "DataTransferJob", resourceId: job.id });
  }
  return job;
}

export const EXPORTS = {
  contacts: { label: "Contacts", admin: false },
  companies: { label: "Companies", admin: false },
  deals: { label: "Deals", admin: false },
  campaign_metrics: { label: "Campaign Analytics", admin: false },
  audit_log: { label: "Audit Log", admin: true },
  workspace_backup: { label: "Full Workspace Backup", admin: true },
} as const;

export type ExportEntity = keyof typeof EXPORTS;
const CAP = 50000;

/** Builds an export body and records the job. */
export async function buildExport(c: Ctx, entity: ExportEntity, format: "csv" | "json") {
  const w = c.workspaceId;
  let body = "";
  let rows = 0;
  const stamp = new Date().toISOString().slice(0, 10);
  if (entity === "contacts") {
    const r = await db.contact.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "asc" }, take: CAP, select: { email: true, firstName: true, lastName: true, name: true, phone: true, jobTitle: true, companyName: true, status: true, tags: true, leadScore: true, createdAt: true } });
    rows = r.length;
    body = format === "json" ? JSON.stringify(r, null, 2) : toCsv(["Email", "First name", "Last name", "Full name", "Phone", "Job title", "Company", "Status", "Tags", "Lead score", "Created"], r.map((x) => [x.email, x.firstName, x.lastName, x.name, x.phone, x.jobTitle, x.companyName, x.status, x.tags, x.leadScore, x.createdAt]));
  } else if (entity === "companies") {
    const r = await db.company.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "asc" }, take: CAP, select: { name: true, domain: true, website: true, industry: true, size: true, location: true, createdAt: true } });
    rows = r.length;
    body = format === "json" ? JSON.stringify(r, null, 2) : toCsv(["Name", "Domain", "Website", "Industry", "Size", "Location", "Created"], r.map((x) => [x.name, x.domain, x.website, x.industry, x.size, x.location, x.createdAt]));
  } else if (entity === "deals") {
    const r = await db.deal.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "asc" }, take: CAP, select: { name: true, value: true, currency: true, status: true, closeDate: true, createdAt: true, stage: { select: { name: true } }, contact: { select: { email: true } }, company: { select: { name: true } } } });
    rows = r.length;
    body = format === "json" ? JSON.stringify(r, null, 2) : toCsv(["Deal name", "Value", "Currency", "Stage", "Status", "Close date", "Contact email", "Company", "Created"], r.map((x) => [x.name, x.value, x.currency, x.stage?.name, x.status, x.closeDate, x.contact?.email, x.company?.name, x.createdAt]));
  } else if (entity === "campaign_metrics") {
    const r = await db.campaignMetric.findMany({ where: { campaign: { workspaceId: w } }, orderBy: { date: "asc" }, take: CAP, select: { date: true, impressions: true, clicks: true, conversions: true, revenue: true, spend: true, campaign: { select: { name: true, channel: true } } } });
    rows = r.length;
    body = format === "json" ? JSON.stringify(r, null, 2) : toCsv(["Date", "Campaign", "Channel", "Impressions", "Clicks", "Conversions", "Revenue", "Spend"], r.map((x) => [x.date, x.campaign.name, x.campaign.channel, x.impressions, x.clicks, x.conversions, x.revenue, x.spend]));
  } else if (entity === "audit_log") {
    const r = await db.auditLog.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "desc" }, take: CAP, select: { createdAt: true, action: true, resourceType: true, resourceId: true, metadata: true, user: { select: { email: true } } } });
    rows = r.length;
    body = format === "json" ? JSON.stringify(r, null, 2) : toCsv(["When", "Actor", "Action", "Resource type", "Resource id", "Details"], r.map((x) => [x.createdAt, x.user?.email, x.action, x.resourceType, x.resourceId, x.metadata ? JSON.stringify(x.metadata) : ""]));
  } else {
    // Core business records only; secrets, tokens and credentials are never included.
    const [workspace, contacts, companies, deals, pipelines, campaigns, segments, forms, landingPages, workflows] = await Promise.all([
      db.workspace.findUnique({ where: { id: w }, select: { name: true, slug: true, createdAt: true } }),
      db.contact.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.company.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.deal.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.pipeline.findMany({ where: { workspaceId: w }, include: { stages: true } }),
      db.campaign.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.segment.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.form.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.landingPage.findMany({ where: { workspaceId: w }, take: CAP, }),
      db.workflow.findMany({ where: { workspaceId: w }, take: CAP, }),
    ]);
    const data = { exportedAt: new Date().toISOString(), workspace, contacts, companies, deals, pipelines, campaigns, segments, forms, landingPages, workflows };
    rows = contacts.length + companies.length + deals.length + campaigns.length + segments.length + forms.length + landingPages.length + workflows.length;
    body = JSON.stringify(data, null, 2);
    format = "json";
  }
  const fileName = `${entity.replace(/_/g, "-")}-${stamp}.${format}`;
  const job = await db.dataTransferJob.create({ data: { workspaceId: w, kind: "export", entity, fileName, format, status: "completed", totalRows: rows, createdById: c.userId, completedAt: new Date() } });
  await db.auditLog.create({ data: { workspaceId: w, actorUserId: c.userId, action: `data.export_${entity}`, resourceType: "DataTransferJob", resourceId: job.id, metadata: { rows, format } } }).catch(() => null);
  return { body, fileName, format, rows };
}
