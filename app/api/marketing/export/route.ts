import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v);
  // Neutralise spreadsheet formulas and quote every cell.
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};
const csv = (name: string, head: string[], rows: unknown[][]) =>
  new NextResponse([head, ...rows].map((r) => r.map(cell).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"` } });

const since = (v: string | null) => new Date(Date.now() - ([7, 30, 90].includes(Number(v)) ? Number(v) : 30) * 86400000);

/** GET /api/marketing/export?kind=executions|submissions|lead-scores|automation|landing — workspace CSV exports. */
export const GET = route(async (ctx, req) => {
  const u = new URL(req.url);
  const kind = u.searchParams.get("kind");
  const w = ctx.workspaceId;
  const from = since(u.searchParams.get("days"));
  if (kind === "executions") {
    const rows = await db.workflowExecution.findMany({ where: { workflow: { workspaceId: w }, startedAt: { gte: from } }, include: { workflow: { select: { name: true } } }, orderBy: { startedAt: "desc" }, take: 5000 });
    return csv("execution-logs", ["run_id", "workflow", "environment", "status", "attempt", "started_at", "completed_at", "error"], rows.map((r) => [r.id, r.workflow.name, r.environment, r.status, r.attempt, r.startedAt, r.completedAt, r.error]));
  }
  if (kind === "submissions") {
    const formId = u.searchParams.get("form");
    const rows = await db.formSubmission.findMany({ where: { form: { workspaceId: w }, ...(formId ? { formId } : {}), createdAt: { gte: from } }, include: { form: { select: { name: true } }, contact: { select: { email: true } } }, orderBy: { createdAt: "desc" }, take: 10000 });
    return csv("form-submissions", ["submitted_at", "form", "source", "contact_email", "consent", "data"], rows.map((r) => [r.createdAt, r.form.name, r.source, r.contact?.email, r.consent ? "yes" : "no", JSON.stringify(r.data)]));
  }
  if (kind === "lead-scores") {
    const rows = await db.contact.findMany({ where: { workspaceId: w }, orderBy: { leadScore: "desc" }, select: { email: true, name: true, companyName: true, status: true, leadScore: true }, take: 10000 });
    return csv("lead-scores", ["email", "name", "company", "status", "lead_score"], rows.map((r) => [r.email, r.name, r.companyName, r.status, r.leadScore ?? 0]));
  }
  if (kind === "automation") {
    const flows = await db.workflow.findMany({ where: { workspaceId: w }, include: { executions: { where: { startedAt: { gte: from } }, select: { status: true, goalReached: true } } } });
    return csv("automation-report", ["workflow", "status", "version", "runs", "completed", "failed", "goal_completions"], flows.map((f) => [f.name, f.status, f.version, f.executions.length, f.executions.filter((e) => e.status === "completed").length, f.executions.filter((e) => e.status === "failed").length, f.executions.filter((e) => e.goalReached).length]));
  }
  if (kind === "landing") {
    const pages = await db.landingPage.findMany({ where: { workspaceId: w }, select: { id: true, title: true, slug: true, status: true } });
    const visits = await db.landingPageVisit.groupBy({ by: ["landingPageId"], where: { workspaceId: w, createdAt: { gte: from } }, _count: true });
    const conv = await db.landingPageVisit.groupBy({ by: ["landingPageId"], where: { workspaceId: w, createdAt: { gte: from }, converted: true }, _count: true });
    return csv("landing-page-analytics", ["page", "slug", "status", "visits", "conversions"], pages.map((p) => [p.title, p.slug, p.status, visits.find((v) => v.landingPageId === p.id)?._count ?? 0, conv.find((v) => v.landingPageId === p.id)?._count ?? 0]));
  }
  return NextResponse.json({ error: "Unknown export." }, { status: 400 });
});
