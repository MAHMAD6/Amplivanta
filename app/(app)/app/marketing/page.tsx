import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Bell, Eye, FileText, Mail, Megaphone, Star, UserPlus, Workflow } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, Panel, Pill, RangeSelect, ScreenHeader, StatGrid, fmtDateTime, figure } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { headerOutline, outlineSm } from "@/components/amplivanta/growth-kit";
import { createCampaign, createForm, createLandingPage, createWorkflow } from "@/app/(app)/app/marketing/actions";
import { daysAgo, marketingContext, rangeDays, triggerOptions } from "@/lib/server/marketing-screens";
import { actionLabel } from "@/lib/server/workspace-screens";
import { CAMPAIGN_CHANNELS, CAMPAIGN_GOALS, CAMPAIGN_STATUSES, label } from "@/lib/marketing/options";
import { emailProvider } from "@/lib/email";

export const metadata: Metadata = { title: "Marketing Automation" };
export const dynamic = "force-dynamic";

const crumbs: [string, string?][] = [["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Dashboard"]];
const MA_PREFIXES = ["campaign.", "automation.", "email.", "form.", "page.", "segment.", "scoring.", "experiment."];

type SP = { days?: string; campaign?: string; workflow?: string };

export default async function MarketingDashboardPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "7");
  const c = await marketingContext();
  const from = daysAgo(days);
  let d = {
    activeCampaigns: 0, activeWorkflows: 0, emailsSent: 0, newLeads: 0, submissions: 0, views: 0,
    campaigns: [] as { id: string; name: string; status: string; channel: string | null; startDate: Date | null; endDate: Date | null; budget: number | null; spend: number | null }[],
    runs: [] as [string, number][], workflows: [] as { id: string; name: string }[],
    funnel: { visitors: 0, leads: 0, qualified: 0, opportunities: 0, customers: 0 },
    activity: [] as { id: string; action: string; createdAt: Date }[],
    alerts: [] as { title: string; href: string }[],
    content: [] as { label: string; value: string; href: string }[],
    triggers: [] as [string, string][],
  };
  if (c) {
    const w = c.workspaceId;
    try {
      const [ac, aw, es, nl, fs, lv, camps, flows, execs, qual, opps, won, logs, failed, scheduledNoProvider, idleForms, unverified, pageConv, emailOpens, triggers] = await Promise.all([
        db.campaign.count({ where: { workspaceId: w, status: "active" } }),
        db.workflow.count({ where: { workspaceId: w, status: "active" } }),
        db.emailSend.count({ where: { emailCampaign: { workspaceId: w }, status: "sent", createdAt: { gte: from } } }),
        db.contact.count({ where: { workspaceId: w, createdAt: { gte: from } } }),
        db.formSubmission.count({ where: { form: { workspaceId: w }, createdAt: { gte: from } } }),
        db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: from } } }),
        db.campaign.findMany({ where: { workspaceId: w, ...(sp.campaign ? { id: sp.campaign } : { status: { not: "archived" } }) }, orderBy: { updatedAt: "desc" }, take: 6, select: { id: true, name: true, status: true, channel: true, startDate: true, endDate: true, budget: true, spend: true } }),
        db.workflow.findMany({ where: { workspaceId: w }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" }, take: 50 }),
        db.workflowExecution.groupBy({ by: ["workflowId"], where: { workflow: { workspaceId: w }, startedAt: { gte: from }, environment: "live", ...(sp.workflow ? { workflowId: sp.workflow } : {}) }, _count: true }),
        db.contact.count({ where: { workspaceId: w, createdAt: { gte: from }, status: "qualified" } }),
        db.deal.count({ where: { workspaceId: w, createdAt: { gte: from } } }),
        db.deal.count({ where: { workspaceId: w, status: "won", updatedAt: { gte: from } } }),
        db.auditLog.findMany({ where: { workspaceId: w, OR: MA_PREFIXES.map((p) => ({ action: { startsWith: p } })) }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, action: true, createdAt: true } }),
        db.workflowExecution.count({ where: { workflow: { workspaceId: w }, status: "failed", startedAt: { gte: from } } }),
        emailProvider() ? 0 : db.emailCampaign.count({ where: { workspaceId: w, status: "scheduled" } }),
        db.form.count({ where: { workspaceId: w, status: "active", submissions: { none: {} } } }),
        db.domain.count({ where: { workspaceId: w, isVerified: false } }),
        db.landingPageVisit.groupBy({ by: ["landingPageId"], where: { workspaceId: w, createdAt: { gte: from }, converted: true }, _count: true, orderBy: { _count: { landingPageId: "desc" } }, take: 3 }),
        db.emailSend.groupBy({ by: ["emailCampaignId"], where: { emailCampaign: { workspaceId: w }, openedAt: { gte: from } }, _count: true, orderBy: { _count: { emailCampaignId: "desc" } }, take: 3 }),
        triggerOptions(w),
      ]);
      const pages = await db.landingPage.findMany({ where: { id: { in: pageConv.map((p) => p.landingPageId) } }, select: { id: true, title: true } });
      const emails = await db.emailCampaign.findMany({ where: { id: { in: emailOpens.map((e) => e.emailCampaignId!).filter(Boolean) } }, select: { id: true, name: true } });
      d = {
        activeCampaigns: ac, activeWorkflows: aw, emailsSent: es, newLeads: nl, submissions: fs, views: lv, campaigns: camps,
        runs: execs.map((e): [string, number] => [flows.find((f) => f.id === e.workflowId)?.name ?? "Workflow", e._count]).sort((a, b) => b[1] - a[1]),
        workflows: flows,
        funnel: { visitors: lv, leads: nl, qualified: qual, opportunities: opps, customers: won },
        activity: logs,
        alerts: [
          ...(failed ? [{ title: `${failed} workflow run${failed === 1 ? "" : "s"} failed in this period`, href: "/app/marketing/execution-logs?status=failed" }] : []),
          ...(scheduledNoProvider ? [{ title: `${scheduledNoProvider} scheduled email${scheduledNoProvider === 1 ? "" : "s"} can't send: email sending is not configured`, href: "/app/marketing/emails" }] : []),
          ...(idleForms ? [{ title: `${idleForms} active form${idleForms === 1 ? " has" : "s have"} no submissions yet`, href: "/app/marketing/form-analytics" }] : []),
          ...(unverified ? [{ title: `${unverified} domain${unverified === 1 ? " is" : "s are"} not verified`, href: "/app/marketing/domains" }] : []),
        ],
        content: [
          ...pageConv.map((p) => ({ label: pages.find((x) => x.id === p.landingPageId)?.title ?? "Landing page", value: `${p._count} conversions`, href: "/app/marketing/landing-page-analytics" })),
          ...emailOpens.map((e) => ({ label: emails.find((x) => x.id === e.emailCampaignId)?.name ?? "Email", value: `${e._count} opens`, href: "/app/marketing/emails" })),
        ],
        triggers,
      };
    } catch {
      /* database unavailable: empty states */
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const funnel: [string, number][] = [["Visitors", d.funnel.visitors], ["Leads", d.funnel.leads], ["Qualified Leads", d.funnel.qualified], ["Opportunities", d.funnel.opportunities], ["Customers", d.funnel.customers]];
  const hasFunnel = funnel.some(([, v]) => v > 0);
  const filter = (name: "campaign" | "workflow", all: string, options: { id: string; name: string }[]) => (
    <form method="get" className="flex items-center gap-1.5">
      <input type="hidden" name="days" value={days} />
      {name === "workflow" && sp.campaign && <input type="hidden" name="campaign" value={sp.campaign} />}
      {name === "campaign" && sp.workflow && <input type="hidden" name="workflow" value={sp.workflow} />}
      <select name={name} defaultValue={sp[name] ?? ""} aria-label={all} className="h-9 rounded-md border border-line bg-white px-2 text-[12.5px]">
        <option value="">{all}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <button className="h-9 rounded-md border border-line px-3 text-[12px] font-semibold">Go</button>
    </form>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={crumbs}
        title="Marketing Automation"
        actions={
          <>
            <RangeSelect days={days} />
            <FormDialog title="Create Campaign" label="+ Create Campaign" className={headerOutline} action={createCampaign} disabled={!canEdit} goTo="/app/marketing/campaigns?c=" submitLabel="Create campaign" fields={[{ name: "name", label: "Campaign name", kind: "text", required: true }, { name: "channel", label: "Channel", kind: "select", options: CAMPAIGN_CHANNELS, placeholder: "Select" }, { name: "goal", label: "Goal", kind: "select", options: CAMPAIGN_GOALS, placeholder: "Select" }, { name: "startDate", label: "Start date", kind: "date" }, { name: "endDate", label: "End date", kind: "date" }]} />
            <FormDialog title="Build Workflow" label="Build Workflow" className={headerOutline} action={createWorkflow} disabled={!canEdit} goTo="/app/marketing/workflows?id=" submitLabel="Open builder" fields={[{ name: "name", label: "Workflow name", kind: "text", required: true }, { name: "trigger", label: "Trigger", kind: "select", options: d.triggers, placeholder: "Choose later" }]} />
            <FormDialog title="Create Form" label="Create Form" className={headerOutline} action={createForm} disabled={!canEdit} goTo="/app/marketing/forms?id=" submitLabel="Open form builder" fields={[{ name: "name", label: "Form name", kind: "text", required: true }]} />
            <FormDialog title="Create Landing Page" label="Create Landing Page" className={headerOutline} action={createLandingPage} disabled={!canEdit} goTo="/app/marketing/page-builder?id=" submitLabel="Open builder" fields={[{ name: "title", label: "Page name", kind: "text", required: true }]} />
          </>
        }
      />
      <StatGrid
        cols={6}
        stats={[
          { label: "Active Campaigns", icon: Megaphone, value: figure(d.activeCampaigns), hint: d.activeCampaigns ? "Status active" : "No active campaigns" },
          { label: "Workflows Active", icon: Workflow, value: figure(d.activeWorkflows), hint: d.activeWorkflows ? "Published and on" : "No active workflows", tone: "green" },
          { label: "Emails Sent", icon: Mail, value: figure(d.emailsSent), hint: d.emailsSent ? `Last ${days} days` : "No emails sent", tone: "violet" },
          { label: "New Leads", icon: UserPlus, value: figure(d.newLeads), hint: d.newLeads ? `Contacts added, last ${days} days` : "No new leads", tone: "orange" },
          { label: "Form Submissions", icon: FileText, value: figure(d.submissions), hint: d.submissions ? `Last ${days} days` : "No submissions", tone: "pink" },
          { label: "Landing Page Views", icon: Eye, value: figure(d.views), hint: d.views ? `Last ${days} days` : "No page views", tone: "teal" },
        ]}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Campaign Health" action={filter("campaign", "All Campaigns", d.campaigns)}>
          {d.campaigns.length ? (
            <ul className="divide-y divide-line">
              {d.campaigns.map((x) => {
                const late = x.endDate && x.endDate < new Date() && x.status === "active";
                return (
                  <li key={x.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                    <span className="min-w-0"><Link href={`/app/marketing/campaigns?c=${x.id}`} className="block truncate font-semibold text-deep-navy hover:text-[#0B5CFF]">{x.name}</Link><span className="text-[12px] text-ink-muted">{label(CAMPAIGN_CHANNELS, x.channel)}{x.budget ? ` · $${(x.spend ?? 0).toLocaleString()} of $${x.budget.toLocaleString()}` : ""}</span></span>
                    <Pill tone={late ? "amber" : x.status === "active" ? "green" : "gray"}>{late ? "Past end date" : label(CAMPAIGN_STATUSES, x.status)}</Pill>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={Activity} title="No campaign data yet" body="Create a campaign to start tracking performance and see health metrics here." action={<FormDialog title="Create Campaign" label="Create Campaign" className={outlineSm} action={createCampaign} disabled={!canEdit} submitLabel="Create campaign" fields={[{ name: "name", label: "Campaign name", kind: "text", required: true }]} />} />
          )}
        </Panel>
        <Panel title="Workflow Activity" action={filter("workflow", "All Workflows", d.workflows)}>
          {d.runs.length ? <><BarList rows={d.runs} /><p className="mt-3 text-[11.5px] text-ink-muted">Live runs started in the last {days} days.</p></> : <EmptyState icon={Workflow} tone="green" title="No workflow activity" body="Create a workflow to begin automation and see activity over time." action={<Link href="/app/marketing/workflows" className={outlineSm}>Build Workflow</Link>} />}
        </Panel>
        <Panel title="Lead Funnel" subtitle={`Last ${days} days`}>
          <ul className="space-y-3">
            {funnel.map(([l, v]) => (
              <li key={l} className="flex items-center justify-between border-b border-line pb-2.5 text-[13.5px] last:border-0">
                <span className="font-semibold text-deep-navy">{l}</span>
                <span className="font-semibold tabular-nums text-deep-navy">{hasFunnel ? v.toLocaleString("en-US") : "—"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11.5px] text-ink-muted">Visitors are landing page visits; qualified leads are new contacts with status Qualified; customers are deals won.</p>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Recent Activity">
          {d.activity.length ? (
            <ul className="divide-y divide-line">{d.activity.map((a) => <li key={a.id} className="flex justify-between gap-3 py-2 text-[13px]"><span className="capitalize text-deep-navy">{a.action.split(".")[0]} {actionLabel(a.action)}</span><span className="shrink-0 text-[12px] text-ink-muted">{fmtDateTime(a.createdAt)}</span></li>)}</ul>
          ) : (
            <EmptyState icon={FileText} title="No recent activity" body="Your recent automation activity will appear here." />
          )}
        </Panel>
        <Panel title="Alerts & Recommendations">
          {d.alerts.length ? (
            <ul className="space-y-2">{d.alerts.map((a) => <li key={a.title}><Link href={a.href} className="block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900 hover:border-amber-300">{a.title}</Link></li>)}</ul>
          ) : (
            <EmptyState icon={Bell} tone="orange" title="No alerts or recommendations" body="You're all caught up. We'll notify you about important updates here." />
          )}
        </Panel>
        <Panel title="Top Performing Content" subtitle={`Last ${days} days`}>
          {d.content.length ? (
            <ul className="divide-y divide-line">{d.content.map((x) => <li key={x.label + x.value}><Link href={x.href} className="flex justify-between gap-3 py-2.5 text-[13px] hover:text-[#0B5CFF]"><span className="truncate font-semibold text-deep-navy">{x.label}</span><span className="shrink-0 text-ink-soft">{x.value}</span></Link></li>)}</ul>
          ) : (
            <EmptyState icon={Star} tone="violet" title="No content data yet" body="Content performance will appear here once data is available." />
          )}
        </Panel>
      </div>
      <p className="mt-4 text-[12px] text-ink-muted">Data for all metrics comes from your campaigns, workflows, forms, emails and landing pages in this workspace.</p>
    </div>
  );
}
