import type { Metadata } from "next";
import Link from "next/link";
import { Award, FileText, LineChart, Link2, PieChart, Settings2, TrendingUp, UserCheck } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, Panel, ScreenHeader, StatGrid, TrendColumns, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, headerOutline, headerPrimary } from "@/components/amplivanta/growth-kit";
import { dailySeries, daysAgo, marketingContext, pct, rangeDays } from "@/lib/server/marketing-screens";
import { bandFor } from "@/lib/marketing/logic";

export const metadata: Metadata = { title: "Form Submissions Analytics" };
export const dynamic = "force-dynamic";

type SP = { form?: string; source?: string; days?: string };
const SOURCE_LABEL: Record<string, string> = { hosted_form: "Hosted form / embed", landing_page: "Landing page" };

export default async function FormAnalyticsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "7");
  const c = await marketingContext();
  let forms: { id: string; name: string; views: number; workflowId: string | null; status: string }[] = [];
  let subs: { formId: string; createdAt: Date; source: string | null; consent: boolean; contactId: string | null }[] = [];
  let contacts: { id: string; status: string; leadScore: number | null }[] = [];
  let bands: { name: string; minScore: number }[] = [];
  let runs = 0;
  let withDeals = 0;
  let pageVisits: { formId: string | null; n: number }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const from = daysAgo(days);
      forms = await db.form.findMany({ where: { workspaceId: w }, select: { id: true, name: true, views: true, workflowId: true, status: true } });
      const ids = sp.form ? [sp.form] : forms.map((f) => f.id);
      subs = await db.formSubmission.findMany({ where: { formId: { in: ids }, createdAt: { gte: from }, ...(sp.source ? { source: sp.source } : {}) }, select: { formId: true, createdAt: true, source: true, consent: true, contactId: true }, take: 50000 });
      const contactIds = [...new Set(subs.map((s) => s.contactId).filter(Boolean) as string[])];
      const pages = await db.landingPage.findMany({ where: { workspaceId: w, formId: { in: ids } }, select: { id: true, formId: true } });
      [contacts, bands, runs, withDeals, pageVisits] = await Promise.all([
        db.contact.findMany({ where: { id: { in: contactIds } }, select: { id: true, status: true, leadScore: true } }),
        db.scoreBand.findMany({ where: { workspaceId: w }, select: { name: true, minScore: true } }),
        db.workflowExecution.count({ where: { workflow: { workspaceId: w }, environment: "live", startedAt: { gte: from }, triggerPayload: { path: ["event"], equals: "form.submitted" } } }),
        db.deal.groupBy({ by: ["contactId"], where: { workspaceId: w, contactId: { in: contactIds } } }).then((r) => r.length),
        Promise.all(pages.map(async (p) => ({ formId: p.formId, n: await db.landingPageVisit.count({ where: { landingPageId: p.id, createdAt: { gte: from } } }) }))),
      ]);
    } catch {
      subs = [];
    }
  }
  const lowest = [...bands].sort((a, b) => a.minScore - b.minScore)[0];
  const qualified = (id: string | null) => {
    const ct = contacts.find((x) => x.id === id);
    if (!ct) return false;
    if (ct.status === "qualified") return true;
    const band = bands.length > 1 ? bandFor(ct.leadScore ?? 0, bands) : null;
    return Boolean(band && band.name !== lowest?.name);
  };
  const qual = subs.filter((s) => qualified(s.contactId)).length;
  const scoped = sp.form ? forms.filter((f) => f.id === sp.form) : forms;
  const views = scoped.reduce((n, f) => n + f.views, 0) + pageVisits.reduce((n, p) => n + p.n, 0);
  const connected = forms.filter((f) => f.workflowId).length;
  const sources = [...new Set(subs.map((s) => s.source ?? "unknown"))].map((s): [string, number] => [SOURCE_LABEL[s] ?? s, subs.filter((x) => (x.source ?? "unknown") === s).length]).sort((a, b) => b[1] - a[1]);
  const perForm = scoped.map((f) => {
    const mine = subs.filter((s) => s.formId === f.id);
    const v = f.views + pageVisits.filter((p) => p.formId === f.id).reduce((n, p) => n + p.n, 0);
    return { ...f, subs: mine.length, v, rate: pct(mine.length, v), qual: mine.filter((s) => qualified(s.contactId)).length };
  }).sort((a, b) => b.qual - a.qual || b.subs - a.subs);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Form Submissions Analytics"]]}
        title="Form Submissions Analytics"
        subtitle="Understand how your forms are performing and the outcomes they generate."
        actions={<><Link href="/app/marketing/forms" className={headerOutline}>View Forms</Link><a href={`/api/marketing/export?kind=submissions&days=${days}${sp.form ? `&form=${sp.form}` : ""}`} className={headerPrimary}>Export Report</a></>}
      />
      <StatGrid
        cols={4}
        stats={[
          { label: "Total Submissions", icon: FileText, value: figure(subs.length), hint: subs.length ? `Last ${days} days` : "No data available", tone: "violet" },
          { label: "Conversion Rate", icon: TrendingUp, value: pct(subs.length, views), hint: views ? `${views.toLocaleString()} views and page visits` : "No data available", tone: "green" },
          { label: "Qualified Submissions", icon: UserCheck, value: figure(qual), hint: subs.length ? (bands.length > 1 ? "Qualified status or above the lowest score band" : "Contacts with status Qualified") : "No data available", tone: "orange" },
          { label: "Connected Workflows", icon: Link2, value: figure(connected), hint: forms.length ? `${connected} of ${forms.length} forms` : "No data available" },
        ]}
      />
      <FilterBar>
        <Select name="form" value={sp.form} all="All Forms" options={forms.map((f) => [f.id, f.name])} label="Form" />
        <Select name="source" value={sp.source} all="All Sources" options={[["hosted_form", "Hosted form / embed"], ["landing_page", "Landing page"]]} label="Source" />
        <Select name="days" value={sp.days} all="Last 7 days" options={[["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Date range" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Submissions Trend" subtitle="Daily">
          {subs.length ? <TrendColumns points={dailySeries(subs.map((s) => s.createdAt), days)} label="Submissions" /> : <EmptyState icon={LineChart} title="No submission data yet" body="Form submissions over time will appear here." />}
        </Panel>
        <Panel title="Source Breakdown">
          {sources.length ? <BarList rows={sources} /> : <EmptyState icon={PieChart} title="No submission data yet" body="Submissions by source will appear here once submissions are received." />}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Form Performance">
          {perForm.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Form Name", "Views", "Submissions", "Conversion Rate", "Qualified ↓", "Connected Workflow"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{perForm.map((f) => <tr key={f.id} className="border-b border-line last:border-0"><td className="px-3 py-2.5"><Link href={`/app/marketing/forms?id=${f.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{f.name}</Link></td><td className="px-3 py-2.5">{f.v}</td><td className="px-3 py-2.5">{f.subs}</td><td className="px-3 py-2.5">{f.rate ?? "—"}</td><td className="px-3 py-2.5">{f.qual}</td><td className="px-3 py-2.5">{f.workflowId ? "Yes" : "No"}</td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={FileText} tone="violet" title="No form data yet" body="Form performance will appear here once submissions are received." />
          )}
        </Panel>
        <Panel title="Submission Quality">
          {subs.length ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Matched to a CRM contact</span><b>{pct(subs.filter((s) => s.contactId).length, subs.length)}</b></li>
              <li className="flex justify-between"><span>Consent given</span><b>{pct(subs.filter((s) => s.consent).length, subs.length)}</b></li>
              <li className="flex justify-between"><span>Qualified</span><b>{pct(qual, subs.length)}</b></li>
              {bands.length < 2 && <li className="text-[12px] text-ink-muted">Add score bands in <Link href="/app/marketing/lead-scoring" className="text-[#0B5CFF]">Lead Scoring</Link> to qualify by score.</li>}
            </ul>
          ) : (
            <EmptyState icon={Award} tone="violet" title="No submission data yet" body="Submission quality insights will appear here once submissions are received." />
          )}
        </Panel>
        <Panel title="CRM / Automation Outcomes">
          {subs.length ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Contacts reached</span><b>{contacts.length}</b></li>
              <li className="flex justify-between"><span>Workflow runs started by forms</span><b>{runs}</b></li>
              <li className="flex justify-between"><span>Contacts with a deal</span><b>{withDeals}</b></li>
            </ul>
          ) : (
            <EmptyState icon={Settings2} tone="violet" title="No outcome data yet" body="CRM and automation outcomes will appear here once submissions are received." />
          )}
        </Panel>
      </div>
      <p className="mt-4 text-[12px] text-ink-muted">Metrics reflect the selected date range and available connected data.</p>
    </div>
  );
}
