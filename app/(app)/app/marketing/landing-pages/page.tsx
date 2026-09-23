import type { Metadata } from "next";
import Link from "next/link";
import { Archive, CheckCircle2, Circle, Clock, ExternalLink, FileText, Globe, LayoutGrid, Link2, List, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Panel, Pill, ScreenHeader, StatGrid, fmtDate, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, headerPrimary, outlineSm, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createLandingPage, deletePage, duplicatePage, importLandingPage, setPageStatus } from "@/app/(app)/app/marketing/actions";
import { daysAgo, hostedPageUrl, marketingContext, pct } from "@/lib/server/marketing-screens";
import { parseBlocks } from "@/lib/marketing/blocks";
import { readiness } from "@/lib/marketing/logic";
import { PAGE_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Landing Pages" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; domain?: string; workflow?: string; form?: string; view?: string; p?: string };
const TONE: Record<string, "green" | "gray" | "blue" | "amber"> = { published: "green", draft: "gray", scheduled: "blue", archived: "amber" };

export default async function LandingPagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  type Row = { id: string; title: string; slug: string; status: string; content: unknown; metaTitle: string | null; metaDescription: string | null; formId: string | null; domainId: string | null; contentReviewed: boolean; seoReviewed: boolean; updatedAt: Date; publishedAt: Date | null };
  let rows: Row[] = [];
  let counts: Record<string, number> = {};
  let domains: { id: string; domain: string; isVerified: boolean }[] = [];
  let forms: { id: string; name: string }[] = [];
  let workflows: { id: string; name: string }[] = [];
  let perf: { id: string; visits: number; conv: number }[] = [];
  let wsSlug = "";
  if (c) {
    try {
      const w = c.workspaceId;
      const formFilter = sp.workflow ? (await db.form.findMany({ where: { workspaceId: w, workflowId: sp.workflow }, select: { id: true } })).map((f) => f.id) : null;
      const [list, grouped, d, f, wf, ws, visits, conv] = await Promise.all([
        db.landingPage.findMany({ where: { workspaceId: w, ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}), ...(sp.status ? { status: sp.status } : {}), ...(sp.domain ? { domainId: sp.domain } : {}), ...(sp.form ? { formId: sp.form } : {}), ...(formFilter ? { formId: { in: formFilter } } : {}) }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, title: true, slug: true, status: true, content: true, metaTitle: true, metaDescription: true, formId: true, domainId: true, contentReviewed: true, seoReviewed: true, updatedAt: true, publishedAt: true } }),
        db.landingPage.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        db.domain.findMany({ where: { workspaceId: w, purpose: "publishing" }, select: { id: true, domain: true, isVerified: true } }),
        db.form.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }),
        db.workflow.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }),
        db.workspace.findUnique({ where: { id: w }, select: { slug: true } }),
        db.landingPageVisit.groupBy({ by: ["landingPageId"], where: { workspaceId: w, createdAt: { gte: daysAgo(30) } }, _count: true }),
        db.landingPageVisit.groupBy({ by: ["landingPageId"], where: { workspaceId: w, createdAt: { gte: daysAgo(30) }, converted: true }, _count: true }),
      ]);
      rows = list;
      counts = Object.fromEntries(grouped.map((g) => [g.status, g._count]));
      domains = d;
      forms = f;
      workflows = wf;
      wsSlug = ws?.slug ?? "";
      perf = visits.map((v) => ({ id: v.landingPageId, visits: v._count, conv: conv.find((x) => x.landingPageId === v.landingPageId)?._count ?? 0 })).sort((a, b) => b.visits - a.visits);
    } catch {
      rows = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const grid = sp.view === "grid";
  const base = Object.fromEntries(Object.entries({ q: sp.q, status: sp.status, domain: sp.domain, workflow: sp.workflow, form: sp.form }).filter(([, v]) => v)) as Record<string, string>;
  const selected = rows.find((r) => r.id === sp.p);
  const check = selected ? readiness({ ...selected, blocks: parseBlocks(selected.content, "page").length, hasFormBlock: parseBlocks(selected.content, "page").some((b) => b.type === "form") }) : null;
  const create = (cls: string, text = "+ Create Landing Page") => <FormDialog title="Create Landing Page" label={text} className={cls} action={createLandingPage} disabled={!canEdit} goTo="/app/marketing/page-builder?id=" submitLabel="Open builder" fields={[{ name: "title", label: "Page name", kind: "text", required: true }, { name: "slug", label: "URL slug (optional)", kind: "text", placeholder: "spring-offer" }]} />;
  const title = (id: string) => rows.find((r) => r.id === id)?.title ?? "Landing page";

  const actions = (r: Row) => (
    <span className="flex flex-wrap gap-1.5">
      <Link href={`?${new URLSearchParams({ ...base, p: r.id })}`} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Readiness</Link>
      {canEdit && <Link href={`/app/marketing/page-builder?id=${r.id}`} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Edit</Link>}
      <Link href={`/app/marketing/publishing?id=${r.id}`} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Publishing</Link>
      {r.status === "published" && wsSlug && <a href={hostedPageUrl(wsSlug, r.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-[#0B5CFF]">View <ExternalLink className="h-3 w-3" /></a>}
      {canEdit && <ActButton action={duplicatePage.bind(null, r.id)}>Duplicate</ActButton>}
      {canEdit && r.status !== "archived" && <ActButton action={setPageStatus.bind(null, r.id, "archived")} confirm="Archive this page? It will stop being served.">Archive</ActButton>}
      {canEdit && <ActButton action={deletePage.bind(null, r.id)} confirm="Delete this page and its versions?">Delete</ActButton>}
    </span>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Landing Pages"]]}
        title="Landing Pages"
        actions={<><FormDialog title="Import Template" label="Import Template" className={headerOutline} action={importLandingPage} disabled={!canEdit} goTo="/app/marketing/page-builder?id=" submitLabel="Import" note='Paste exported page JSON: { "title": "…", "blocks": [ { "type": "hero", "props": { "heading": "…" } } ] }. Unsupported sections are dropped.' fields={[{ name: "json", label: "Page JSON", kind: "textarea", rows: 10, required: true }]} />{create(headerPrimary)}</>}
      />
      <StatGrid
        cols={5}
        stats={[
          { label: "Published", icon: Globe, value: figure(counts.published), hint: " ", tone: "green" },
          { label: "Draft", icon: FileText, value: figure(counts.draft), hint: " ", tone: "violet" },
          { label: "Scheduled", icon: Clock, value: figure(counts.scheduled), hint: " ", tone: "orange" },
          { label: "Archived", icon: Archive, value: figure(counts.archived), hint: " " },
          { label: "Connected Domains", icon: Link2, value: figure(domains.filter((d) => d.isVerified).length), hint: domains.length ? `${domains.length} added` : " " },
        ]}
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search landing pages..." aria-label="Search landing pages" className={filterSearch} />
        <Select name="status" value={sp.status} all="All Statuses" options={PAGE_STATUSES} label="Status" />
        <Select name="domain" value={sp.domain} all="All Domains" options={domains.map((d) => [d.id, d.domain])} label="Domain" />
        <Select name="workflow" value={sp.workflow} all="All Workflows" options={workflows.map((f) => [f.id, f.name])} label="Workflow" />
        <Select name="form" value={sp.form} all="All Forms" options={forms.map((f) => [f.id, f.name])} label="Form" />
        {grid && <input type="hidden" name="view" value="grid" />}
        <span className="ml-auto flex gap-1">
          <Link aria-label="Grid view" href={`?${new URLSearchParams({ ...base, view: "grid" })}`} className={cn("rounded-md border p-2", grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><LayoutGrid className="h-4 w-4" /></Link>
          <Link aria-label="List view" href={`?${new URLSearchParams(base)}`} className={cn("rounded-md border p-2", !grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><List className="h-4 w-4" /></Link>
        </span>
      </FilterBar>
      <Panel className="mb-4">
        {!rows.length ? (
          <EmptyState icon={FileText} title={total ? "No landing pages match these filters" : "No landing pages yet"} body="Create a landing page or start from a template when you are ready." action={total ? undefined : <span className="flex gap-2">{create(primarySm, "Create Landing Page")}<Link href="/app/marketing/landing-page-templates" className={outlineSm}>Use Template</Link></span>} />
        ) : grid ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
              <div key={r.id} className={cn("rounded-xl border p-4", sp.p === r.id ? "border-[#0B5CFF]" : "border-line")}>
                <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-deep-navy">{r.title}</h3><Pill tone={TONE[r.status] ?? "gray"}>{label(PAGE_STATUSES, r.status)}</Pill></div>
                <p className="mt-1 break-all font-mono text-[12px] text-ink-muted">/{r.slug}</p>
                <p className="mt-1 text-[12px] text-ink-soft">{parseBlocks(r.content, "page").length} sections · Updated {fmtDate(r.updatedAt)}</p>
                <div className="mt-3">{actions(r)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Page", "Status", "Form", "Sections", "Updated", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={cn("border-b border-line last:border-0", sp.p === r.id && "bg-royal-tint/30")}>
                    <td className="px-3 py-2.5"><span className="font-semibold text-deep-navy">{r.title}</span><div className="font-mono text-[11.5px] text-ink-muted">/{r.slug}</div></td>
                    <td className="px-3 py-2.5"><Pill tone={TONE[r.status] ?? "gray"}>{label(PAGE_STATUSES, r.status)}</Pill></td>
                    <td className="px-3 py-2.5 text-ink-soft">{forms.find((f) => f.id === r.formId)?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{parseBlocks(r.content, "page").length}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{fmtDate(r.updatedAt)}</td>
                    <td className="px-3 py-2.5">{actions(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Launch Readiness" subtitle={selected ? selected.title : undefined}>
          {selected && check ? (
            <>
              <ul className="space-y-3">
                {check.items.map((i) => (
                  <li key={i.key} className="flex gap-3">
                    {i.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <Circle className={cn("mt-0.5 h-5 w-5", i.blocking ? "text-red-500" : "text-ink-muted")} />}
                    <span><span className="block text-[13.5px] font-semibold text-deep-navy">{i.label}{i.blocking ? " (required)" : ""}</span><span className="text-[12.5px] text-ink-soft">{i.detail}</span></span>
                  </li>
                ))}
              </ul>
              <Link href={`/app/marketing/publishing?id=${selected.id}`} className={cn(outlineSm, "mt-4")}>Open publishing checklist</Link>
            </>
          ) : (
            <EmptyState icon={Rocket} tone="violet" title="No landing page selected" body="Select Readiness on a landing page to view its launch checklist." />
          )}
        </Panel>
        <Panel title="Page Performance" subtitle="Last 30 days">
          {perf.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line text-deep-navy">{["Page", "Visits", "Conversions", "Rate"].map((h) => <th key={h} className="py-2 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{perf.slice(0, 8).map((p) => <tr key={p.id} className="border-b border-line last:border-0"><td className="py-2 font-semibold text-deep-navy">{title(p.id)}</td><td className="py-2">{p.visits}</td><td className="py-2">{p.conv}</td><td className="py-2">{pct(p.conv, p.visits)}</td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={FileText} title="No performance data yet" body="Performance appears after a landing page is published and receives traffic." />
          )}
        </Panel>
      </div>
    </div>
  );
}
