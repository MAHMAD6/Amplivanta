import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BarChart3, CalendarDays, CheckCircle2, Circle, Clock, Eye, FileText, Globe, History, RotateCcw, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Panel, Pill, ScreenHeader, StatGrid, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { DateTimeAction } from "@/components/amplivanta/marketing-builders";
import { publishPage, rollbackPage, schedulePage, setPageReview, setPageStatus, updatePublishSettings } from "@/app/(app)/app/marketing/actions";
import { daysAgo, hostedPageUrl, marketingContext, pct } from "@/lib/server/marketing-screens";
import { parseBlocks } from "@/lib/marketing/blocks";
import { readiness } from "@/lib/marketing/logic";
import { PAGE_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Landing Page Publishing" };
export const dynamic = "force-dynamic";

export default async function LandingPagePublishingPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  let pages: { id: string; title: string; status: string }[] = [];
  let page: Awaited<ReturnType<typeof db.landingPage.findFirst>> = null;
  let versions: { version: number; createdAt: Date; createdById: string | null }[] = [];
  let domains: { id: string; domain: string }[] = [];
  let wsSlug = "";
  let formActive = false;
  let mon = { visits: 0, conv: 0, last: null as Date | null };
  if (c) {
    try {
      const w = c.workspaceId;
      [pages, domains] = await Promise.all([
        db.landingPage.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, status: true } }),
        db.domain.findMany({ where: { workspaceId: w, purpose: "publishing", isVerified: true }, select: { id: true, domain: true } }),
      ]);
      wsSlug = (await db.workspace.findUnique({ where: { id: w }, select: { slug: true } }))?.slug ?? "";
      const id = sp.id ?? pages[0]?.id;
      if (id) page = await db.landingPage.findFirst({ where: { id, workspaceId: w } });
      if (page) {
        const since = daysAgo(7);
        const [v, f, visits, conv, last] = await Promise.all([
          db.landingPageVersion.findMany({ where: { landingPageId: page.id }, orderBy: { version: "desc" }, take: 20, select: { version: true, createdAt: true, createdById: true } }),
          page.formId ? db.form.findFirst({ where: { id: page.formId, status: "active" }, select: { id: true } }) : Promise.resolve(null),
          db.landingPageVisit.count({ where: { landingPageId: page.id, createdAt: { gte: since } } }),
          db.landingPageVisit.count({ where: { landingPageId: page.id, createdAt: { gte: since }, converted: true } }),
          db.landingPageVisit.findFirst({ where: { landingPageId: page.id }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
        ]);
        versions = v;
        formActive = Boolean(f);
        mon = { visits, conv, last: last?.createdAt ?? null };
      }
    } catch {
      page = null;
    }
  }
  const blocks = page ? parseBlocks(page.content, "page") : [];
  const check = page ? readiness({ ...page, blocks: blocks.length, hasFormBlock: blocks.some((b) => b.type === "form") }) : null;
  const domain = domains.find((d) => d.id === page?.domainId);
  const url = page && wsSlug ? hostedPageUrl(wsSlug, page.slug) : "";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Landing Page Publishing"]]}
        title="Landing Page Publishing"
        subtitle="Prepare, publish, and monitor your landing pages with confidence."
        actions={
          <>
            {page && <Link href={`/app/marketing/page-builder?id=${page.id}&tab=design`} className={headerOutline}><Eye className="h-4 w-4" /> Preview Page</Link>}
            {page && <Link href={`/app/marketing/page-builder?id=${page.id}`} className={headerOutline}>Edit Draft</Link>}
            {page && canEdit && <ActButton action={publishPage.bind(null, page.id)} disabled={!check?.canPublish} title={check?.canPublish ? undefined : "Complete the required checklist items first"} className={cn(headerPrimary, "border-0")}><Rocket className="h-4 w-4" /> Publish Now</ActButton>}
            <Link href="/app/marketing/domains" className={headerOutline}><Globe className="h-4 w-4" /> View Domains</Link>
          </>
        }
      />
      {pages.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
          <label htmlFor="pp" className="px-2 text-[12.5px] font-semibold text-deep-navy">Landing page</label>
          <select id="pp" name="id" defaultValue={page?.id} className="h-9 min-w-[240px] rounded-md border border-line bg-white px-2.5 text-[12.5px]">{pages.map((p) => <option key={p.id} value={p.id}>{p.title} · {label(PAGE_STATUSES, p.status)}</option>)}</select>
          <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Open</button>
        </form>
      )}
      <StatGrid
        cols={4}
        stats={[
          { label: "Publication Status", icon: Rocket, value: page ? label(PAGE_STATUSES, page.status) : null, hint: page?.status === "published" ? `Since ${fmtDateTime(page.publishedAt)}` : page?.status === "scheduled" ? `Publishes ${fmtDateTime(page.scheduledAt)}` : "No page published", tone: "green" },
          { label: "Assigned Domain", icon: Globe, value: page ? domain?.domain ?? "Hosted URL" : null, hint: page ? (domain ? "Custom domain routing requires server setup" : url) : "No domain assigned", tone: "violet" },
          { label: "Current Version", icon: FileText, value: versions[0] ? `v${versions[0].version}` : null, hint: versions[0] ? `Published ${fmtDateTime(versions[0].createdAt)}` : "No version available" },
          { label: "Monitoring Status", icon: Activity, value: page?.status === "published" ? (page.analyticsEnabled ? "Tracking on" : "Tracking off") : null, hint: mon.last ? `Last visit ${fmtDateTime(mon.last)}` : "No monitoring data yet", tone: "orange" },
        ]}
      />
      {!page ? (
        <Panel><EmptyState icon={Rocket} title="No landing pages yet" body="Create a landing page to prepare it for publishing." action={<Link href="/app/marketing/landing-pages" className={outlineSm}>Go to Landing Pages</Link>} /></Panel>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel title="Pre-Publish Checklist" subtitle="Complete these steps to ensure your page is ready for publication.">
              <ul className="space-y-2">
                {check!.items.map((i) => (
                  <li key={i.key} className="flex items-start gap-3 rounded-lg border border-line p-3">
                    {i.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className={cn("h-5 w-5 shrink-0", i.blocking ? "text-red-500" : "text-ink-muted")} />}
                    <span className="min-w-0 flex-1"><b className="block text-[13px] text-deep-navy">{i.label}{i.blocking ? " · required" : ""}</b><span className="text-[12px] text-ink-soft">{i.detail}</span></span>
                    {canEdit && i.key === "content" && blocks.length > 0 && <ActButton action={setPageReview.bind(null, page!.id, "contentReviewed", !page!.contentReviewed)}>{page!.contentReviewed ? "Undo" : "Mark reviewed"}</ActButton>}
                    {canEdit && i.key === "seo" && <ActButton action={setPageReview.bind(null, page!.id, "seoReviewed", !page!.seoReviewed)} disabled={!page!.metaTitle || !page!.metaDescription} title={!page!.metaTitle || !page!.metaDescription ? "Add a meta title and description in the builder" : undefined}>{page!.seoReviewed ? "Undo" : "Mark reviewed"}</ActButton>}
                  </li>
                ))}
                {page.formId && !formActive && <li className="rounded-lg bg-amber-50 p-3 text-[12.5px] text-amber-900">The connected form is not active. Activate it in Lead Capture Forms before publishing.</li>}
              </ul>
            </Panel>
            <Panel title="Publish Settings" subtitle="Configure how and where your landing page will be published.">
              <ul className="space-y-2 text-[13px]">
                {[[Globe, "Destination", domain ? domain.domain : `Hosted: ${url}`], [Eye, "Visibility", page.visibility === "unlisted" ? "Unlisted (not indexed)" : "Public"], [CalendarDays, "Scheduling", page.scheduledAt ? fmtDateTime(page.scheduledAt) : "Publish immediately"], [BarChart3, "Analytics Tracking", page.analyticsEnabled ? "Enabled" : "Disabled"]].map(([I, t, v]) => {
                  const Icon = I as typeof Globe;
                  return <li key={t as string} className="flex items-start gap-3 rounded-lg border border-line p-3"><Icon className="h-5 w-5 shrink-0 text-ink-muted" /><span className="min-w-0"><b className="block text-deep-navy">{t as string}</b><span className="break-all text-[12px] text-ink-soft">{v as string}</span></span></li>;
                })}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <FormDialog title="Publish Settings" label="Configure Settings" className={outlineSm} action={updatePublishSettings} disabled={!canEdit} submitLabel="Save" fields={[{ name: "id", kind: "hidden", value: page.id }, { name: "domainId", label: "Destination domain (verified)", kind: "select", options: domains.map((d) => [d.id, d.domain]), placeholder: "Amplivanta hosted URL", defaultValue: page.domainId ?? "" }, { name: "visibility", label: "Visibility", kind: "select", options: [["public", "Public"], ["unlisted", "Unlisted"]], defaultValue: page.visibility }, { name: "analyticsEnabled", label: "Analytics tracking", kind: "checkbox", defaultChecked: page.analyticsEnabled }]} />
                {canEdit && page.status !== "published" && <DateTimeAction id={page.id} action={schedulePage} label="Schedule" />}
                {canEdit && page.status === "scheduled" && <ActButton action={setPageStatus.bind(null, page.id, "draft")}>Cancel schedule</ActButton>}
              </div>
            </Panel>
            <Panel title="Version History">
              {versions.length ? (
                <ul className="divide-y divide-line">{versions.map((v, i) => <li key={v.version} className="flex items-center justify-between py-2 text-[13px]"><span className="font-semibold text-deep-navy">Version {v.version}{i === 0 && page!.status === "published" && <Pill tone="green">live</Pill>}<span className="block text-[12px] font-normal text-ink-muted">{fmtDateTime(v.createdAt)}</span></span></li>)}</ul>
              ) : (
                <EmptyState icon={Clock} tone="violet" title="No versions yet" body="Publish your page to start tracking versions." />
              )}
            </Panel>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Post-Publish Monitoring" subtitle="Track performance, engagement, and conversions after publishing.">
              {page.status === "published" && mon.visits ? (
                <div className="grid grid-cols-3 gap-3 text-center">{[["Visits (7d)", String(mon.visits)], ["Conversions (7d)", String(mon.conv)], ["Rate", pct(mon.conv, mon.visits) ?? "—"]].map(([l, v]) => <div key={l} className="rounded-lg border border-line p-3"><div className="text-[12px] text-ink-muted">{l}</div><div className="text-[18px] font-bold text-deep-navy">{v}</div></div>)}</div>
              ) : (
                <EmptyState icon={Activity} title="No monitoring data yet" body="Once published, performance data will appear here." action={<Link href={`/app/marketing/landing-page-analytics?page=${page.id}`} className={outlineSm}>View Monitoring</Link>} />
              )}
            </Panel>
            <Panel title="Rollback & Recovery" subtitle="Revert to a previous version or restore your last published state.">
              {versions.length > 1 ? (
                <ul className="divide-y divide-line">{versions.slice(1, 6).map((v) => <li key={v.version} className="flex items-center justify-between py-2 text-[13px]"><span>Version {v.version} · <span className="text-ink-muted">{fmtDateTime(v.createdAt)}</span></span>{canEdit && <ActButton action={rollbackPage.bind(null, page!.id, v.version)} confirm="Publish this version as the live page?"><RotateCcw className="h-3.5 w-3.5" /> Roll back</ActButton>}</li>)}</ul>
              ) : (
                <EmptyState icon={History} tone="violet" title="No rollback available" body="Publish your page at least twice to enable rollback options." />
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
