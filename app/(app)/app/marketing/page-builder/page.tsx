import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LayoutTemplate } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, KeyList, Panel, Pill, ScreenHeader, TabBar, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { PageBuilder } from "@/components/amplivanta/marketing-builders";
import { LandingBlocks } from "@/components/amplivanta/landing-render";
import { createLandingPage, publishPage, rollbackPage, savePage, setPageStatus, updatePublishSettings } from "@/app/(app)/app/marketing/actions";
import { daysAgo, hostedPageUrl, marketingContext, pct } from "@/lib/server/marketing-screens";
import { parseBlocks } from "@/lib/marketing/blocks";
import { parseFields } from "@/lib/marketing/logic";
import { EXPERIMENT_STATUSES, PAGE_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Landing Page Builder" };
export const dynamic = "force-dynamic";

const TABS = [["builder", "Builder"], ["design", "Design"], ["settings", "Settings"], ["ab", "A/B Test"], ["analytics", "Analytics"], ["history", "History"]] as const;

export default async function LandingPageBuilderPage({ searchParams }: { searchParams: Promise<{ id?: string; tab?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  let pages: { id: string; title: string; status: string }[] = [];
  let forms: { id: string; name: string; status: string }[] = [];
  let domains: [string, string][] = [];
  let wsSlug = "";
  let page: Awaited<ReturnType<typeof db.landingPage.findFirst>> = null;
  let versions: { version: number; createdAt: Date }[] = [];
  let experiments: { id: string; name: string; status: string }[] = [];
  let stats = { visits: 0, starts: 0, conv: 0 };
  let form: Awaited<ReturnType<typeof db.form.findFirst>> = null;
  if (c) {
    try {
      const w = c.workspaceId;
      const [p, f, d, ws] = await Promise.all([
        db.landingPage.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, title: true, status: true } }),
        db.form.findMany({ where: { workspaceId: w, status: { not: "archived" } }, select: { id: true, name: true, status: true } }),
        db.domain.findMany({ where: { workspaceId: w, purpose: "publishing", isVerified: true }, select: { id: true, domain: true } }),
        db.workspace.findUnique({ where: { id: w }, select: { slug: true } }),
      ]);
      pages = p;
      forms = f;
      domains = d.map((x) => [x.id, x.domain]);
      wsSlug = ws?.slug ?? "";
      const id = sp.id ?? pages[0]?.id;
      if (id) {
        page = await db.landingPage.findFirst({ where: { id, workspaceId: w } });
        if (page) {
          const since = daysAgo(30);
          const [v, ex, visits, starts, conv, f2] = await Promise.all([
            db.landingPageVersion.findMany({ where: { landingPageId: page.id }, orderBy: { version: "desc" }, take: 30, select: { version: true, createdAt: true } }),
            db.experiment.findMany({ where: { workspaceId: w, landingPageId: page.id }, select: { id: true, name: true, status: true } }),
            db.landingPageVisit.count({ where: { landingPageId: page.id, createdAt: { gte: since } } }),
            db.landingPageVisit.count({ where: { landingPageId: page.id, createdAt: { gte: since }, formStarted: true } }),
            db.landingPageVisit.count({ where: { landingPageId: page.id, createdAt: { gte: since }, converted: true } }),
            page.formId ? db.form.findFirst({ where: { id: page.formId, workspaceId: w } }) : Promise.resolve(null),
          ]);
          versions = v;
          experiments = ex;
          stats = { visits, starts, conv };
          form = f2;
        }
      }
    } catch {
      page = null;
    }
  }
  const tab = (TABS.find(([k]) => k === sp.tab)?.[0] ?? "builder") as (typeof TABS)[number][0];
  const create = (cls: string, text: string) => <FormDialog title="Create Landing Page" label={text} className={cls} action={createLandingPage} disabled={!canEdit} goTo="/app/marketing/page-builder?id=" submitLabel="Open builder" fields={[{ name: "title", label: "Page name", kind: "text", required: true }]} />;
  const live = page && page.status === "published" && wsSlug ? hostedPageUrl(wsSlug, page.slug) : null;
  const analytics = (
    <Panel title="Analytics Overview" subtitle="Last 30 days" className="mt-4">
      {stats.visits ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Visits", String(stats.visits)], ["Form starts", String(stats.starts)], ["Conversions", String(stats.conv)], ["Conversion rate", pct(stats.conv, stats.visits) ?? "—"]].map(([l, v]) => <div key={l} className="rounded-lg border border-line p-3 text-center"><div className="text-[12px] text-ink-muted">{l}</div><div className="text-[18px] font-bold text-deep-navy">{v}</div></div>)}
        </div>
      ) : (
        <p className="py-4 text-center text-[13px] text-ink-soft"><b className="block text-deep-navy">No data yet</b>Publish the page to begin collecting analytics.</p>
      )}
    </Panel>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Landing Page Builder"]]}
        title="Landing Page Builder"
        actions={<>{live && <a href={live} target="_blank" rel="noopener noreferrer" className={headerOutline}>View live <ExternalLink className="h-4 w-4" /></a>}{page && <Link href={`?id=${page.id}&tab=design`} className={headerOutline}>Preview</Link>}{create(headerOutline, "+ New Page")}<Link href="/app/marketing/landing-page-templates" className={headerOutline}>Templates</Link></>}
      />
      {pages.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
          <label htmlFor="pg" className="px-2 text-[12.5px] font-semibold text-deep-navy">Page</label>
          <select id="pg" name="id" defaultValue={page?.id} className="h-9 min-w-[240px] rounded-md border border-line bg-white px-2.5 text-[12.5px]">{pages.map((p) => <option key={p.id} value={p.id}>{p.title} · {label(PAGE_STATUSES, p.status)}</option>)}</select>
          <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Open</button>
          {page && <span className="ml-auto flex items-center gap-2"><Pill tone={page.status === "published" ? "green" : page.status === "scheduled" ? "blue" : "gray"}>{label(PAGE_STATUSES, page.status)}</Pill>{canEdit && page.status === "published" && <ActButton action={setPageStatus.bind(null, page.id, "draft")} confirm="Unpublish this page? Visitors will get a not found page.">Unpublish</ActButton>}</span>}
        </form>
      )}
      {!page ? (
        <Panel><EmptyState icon={LayoutTemplate} title="Start building your landing page" body="Create a page from scratch or a template, add sections, connect a lead form and publish." action={<span className="flex gap-2">{create(headerPrimary, "Create Landing Page")}<Link href="/app/marketing/landing-page-templates" className={outlineSm}>Browse Templates</Link></span>} /></Panel>
      ) : (
        <>
          <div className="mb-4"><TabBar active={TABS.find(([k]) => k === tab)![1]} tabs={TABS.map(([k, l]) => [l, `?id=${page!.id}&tab=${k}`])} /></div>
          {tab === "builder" && (
            <>
              <PageBuilder
                key={`${page.id}-${page.updatedAt.getTime()}`}
                page={{ id: page.id, blocks: parseBlocks(page.content, "page"), settings: { title: page.title, slug: page.slug, metaTitle: page.metaTitle ?? "", metaDescription: page.metaDescription ?? "", socialImage: page.socialImage ?? "", formId: page.formId ?? "" } }}
                forms={forms.map((f) => [f.id, `${f.name}${f.status === "active" ? "" : " (draft)"}`])}
                canEdit={canEdit}
                save={savePage}
                publish={publishPage}
                hostedBase={`/lp/${wsSlug}/`}
              />
              {analytics}
            </>
          )}
          {tab === "design" && (
            <Panel title="Preview" subtitle="Saved draft content. Unsaved builder changes are not shown.">
              <div className="overflow-hidden rounded-xl border border-line">
                <LandingBlocks preview blocks={parseBlocks(page.content, "page")} form={form ? { id: form.id, fields: parseFields(form.fields), submitButtonText: form.submitButtonText, requireConsent: form.requireConsent, consentText: form.consentText, privacyUrl: form.privacyUrl, termsUrl: form.termsUrl } : null} />
              </div>
            </Panel>
          )}
          {tab === "settings" && (
            <Panel title="Publish Settings" className="max-w-[640px]">
              <FormDialog title="Publish Settings" label="Configure Settings" className={outlineSm} action={updatePublishSettings} disabled={!canEdit} submitLabel="Save" fields={[{ name: "id", kind: "hidden", value: page.id }, { name: "domainId", label: "Destination domain (verified)", kind: "select", options: domains, placeholder: "Amplivanta hosted URL", defaultValue: page.domainId ?? "" }, { name: "visibility", label: "Visibility", kind: "select", options: [["public", "Public (indexable)"], ["unlisted", "Unlisted (no search indexing)"]], defaultValue: page.visibility }, { name: "analyticsEnabled", label: "Analytics tracking", kind: "checkbox", defaultChecked: page.analyticsEnabled }]} />
              <div className="mt-4"><KeyList rows={[["Hosted URL", `/lp/${wsSlug}/${page.slug}`], ["Visibility", page.visibility === "unlisted" ? "Unlisted" : "Public"], ["Analytics", page.analyticsEnabled ? "On" : "Off"], ["Meta title", page.metaTitle ?? "—"], ["Lead form", form?.name ?? "Not connected"]]} /></div>
            </Panel>
          )}
          {tab === "ab" && (
            <Panel title="A/B Tests on this page" action={<Link href={`/app/marketing/ab-testing?page=${page.id}`} className={outlineSm}>Create Test</Link>}>
              {experiments.length ? <ul className="divide-y divide-line">{experiments.map((e) => <li key={e.id} className="flex justify-between py-2.5 text-[13px]"><Link href={`/app/marketing/ab-testing?id=${e.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{e.name}</Link><Pill tone={e.status === "running" ? "green" : "gray"}>{label(EXPERIMENT_STATUSES, e.status)}</Pill></li>)}</ul> : <p className="text-[13px] text-ink-soft">No tests use this page as variant A yet.</p>}
            </Panel>
          )}
          {tab === "analytics" && analytics}
          {tab === "history" && (
            <Panel title="Version History">
              {versions.length ? <ul className="divide-y divide-line">{versions.map((v, i) => <li key={v.version} className="flex items-center justify-between py-2.5 text-[13px]"><span className="font-semibold text-deep-navy">Version {v.version}{i === 0 && page!.status === "published" ? " · live" : ""}<span className="ml-2 font-normal text-ink-muted">{fmtDateTime(v.createdAt)}</span></span>{canEdit && i > 0 && <ActButton action={rollbackPage.bind(null, page!.id, v.version)} confirm="Publish this older version as the live page?">Roll back</ActButton>}</li>)}</ul> : <p className="text-[13px] text-ink-soft">No versions yet. Each publish creates a version you can roll back to.</p>}
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
