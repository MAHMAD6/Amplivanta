import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, FileText, Mail, PauseCircle, Send } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Panel, Pill, ScreenHeader, StatGrid, fmtDateTime, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createEmailCampaign, deleteEmail, duplicateEmail, sendEmailNow, setEmailPaused } from "@/app/(app)/app/marketing/actions";
import { marketingContext, pct } from "@/lib/server/marketing-screens";
import { EMAIL_STATUSES, label } from "@/lib/marketing/options";
import { emailProvider } from "@/lib/email";

export const metadata: Metadata = { title: "Email Campaigns" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; workflow?: string; segment?: string; perf?: string };
const TONE: Record<string, "gray" | "blue" | "amber" | "green" | "violet"> = { draft: "gray", scheduled: "blue", sending: "amber", sent: "green", paused: "violet" };

export default async function EmailCampaignsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  type Row = { id: string; name: string; subject: string; status: string; segmentId: string | null; workflowId: string | null; scheduledAt: Date | null; sentAt: Date | null; recipientCount: number; updatedAt: Date };
  let rows: Row[] = [];
  let counts: Record<string, number> = {};
  let segments: { id: string; name: string }[] = [];
  let workflows: { id: string; name: string }[] = [];
  let perf = { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, suppressed: 0 };
  let recent: { id: string; name: string; action: string; at: Date }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const perfScope = { emailCampaign: { workspaceId: w }, ...(sp.perf ? { emailCampaignId: sp.perf } : {}) };
      const [list, grouped, segs, flows, total, delivered, opened, clicked, failed, suppressed, logs] = await Promise.all([
        db.emailCampaign.findMany({ where: { workspaceId: w, ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { subject: { contains: sp.q, mode: "insensitive" } }] } : {}), ...(sp.status ? { status: sp.status } : {}), ...(sp.segment ? { segmentId: sp.segment } : {}), ...(sp.workflow ? { workflowId: sp.workflow } : {}) }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, name: true, subject: true, status: true, segmentId: true, workflowId: true, scheduledAt: true, sentAt: true, recipientCount: true, updatedAt: true } }),
        db.emailCampaign.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        db.segment.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }),
        db.workflow.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }),
        db.emailSend.count({ where: perfScope }),
        db.emailSend.count({ where: { ...perfScope, status: "sent" } }),
        db.emailSend.count({ where: { ...perfScope, openedAt: { not: null } } }),
        db.emailSend.count({ where: { ...perfScope, clickedAt: { not: null } } }),
        db.emailSend.count({ where: { ...perfScope, status: { in: ["failed", "not_sent"] } } }),
        db.emailSend.count({ where: { ...perfScope, status: "suppressed" } }),
        db.auditLog.findMany({ where: { workspaceId: w, action: { startsWith: "email." } }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, action: true, resourceId: true, createdAt: true } }),
      ]);
      rows = list;
      counts = Object.fromEntries(grouped.map((g) => [g.status, g._count]));
      segments = segs;
      workflows = flows;
      perf = { sent: total, delivered, opened, clicked, failed, suppressed };
      const names = await db.emailCampaign.findMany({ where: { id: { in: logs.map((l) => l.resourceId ?? "") } }, select: { id: true, name: true } });
      recent = logs.map((l) => ({ id: l.id, name: names.find((n) => n.id === l.resourceId)?.name ?? "Deleted campaign", action: l.action.split(".")[1], at: l.createdAt }));
    } catch {
      rows = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const seg = (id: string | null) => segments.find((s) => s.id === id)?.name ?? "No audience";
  const create = (cls?: string, text = "+ Create Email Campaign") => <FormDialog title="Create Email Campaign" label={text} className={cls} action={createEmailCampaign} disabled={!canEdit} goTo="/app/marketing/email-composer?id=" submitLabel="Open composer" fields={[{ name: "name", label: "Campaign name", kind: "text", required: true }, { name: "subject", label: "Subject line", kind: "text" }, { name: "segmentId", label: "Audience", kind: "select", options: segments.map((s) => [s.id, s.name]), placeholder: "Choose later" }]} />;
  const provider = emailProvider();

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Email Campaigns"]]}
        title="Email Campaigns"
        actions={<>{create(headerOutline)}<Link href="/app/marketing/deliverability" className={headerOutline}>Deliverability</Link></>}
      />
      {!provider && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">Email sending is not configured on this server yet. You can build and schedule campaigns, but nothing will be delivered until an email provider is set up.</p>}
      <StatGrid
        cols={5}
        stats={[
          { label: "Drafts", icon: FileText, value: figure(counts.draft), hint: counts.draft ? " " : "No data yet" },
          { label: "Scheduled", icon: CalendarDays, value: figure(counts.scheduled), hint: counts.scheduled ? " " : "No data yet", tone: "orange" },
          { label: "Sending", icon: Send, value: figure(counts.sending), hint: counts.sending ? " " : "No data yet", tone: "green" },
          { label: "Sent", icon: Mail, value: figure(counts.sent), hint: counts.sent ? " " : "No data yet" },
          { label: "Paused", icon: PauseCircle, value: figure(counts.paused), hint: counts.paused ? " " : "No data yet", tone: "violet" },
        ]}
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search campaigns..." aria-label="Search email campaigns" className={filterSearch} />
        <Select name="status" value={sp.status} all="All Statuses" options={EMAIL_STATUSES} label="Status" />
        <Select name="workflow" value={sp.workflow} all="All Workflows" options={workflows.map((f) => [f.id, f.name])} label="Workflow" />
        <Select name="segment" value={sp.segment} all="All Audiences" options={segments.map((s) => [s.id, s.name])} label="Audience" />
      </FilterBar>
      <Panel className="mb-4">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Campaign", "Audience", "Status", "Recipients", "Scheduled / Sent", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5"><Link href={`/app/marketing/email-composer?id=${r.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.name}</Link><div className="text-[11.5px] text-ink-muted">{r.subject}</div></td>
                    <td className="px-3 py-2.5 text-ink-soft">{seg(r.segmentId)}</td>
                    <td className="px-3 py-2.5"><Pill tone={TONE[r.status] ?? "gray"}>{label(EMAIL_STATUSES, r.status)}</Pill></td>
                    <td className="px-3 py-2.5 text-ink-soft">{r.recipientCount ? r.recipientCount.toLocaleString("en-US") : "—"}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{r.sentAt ? `Sent ${fmtDateTime(r.sentAt)}` : r.scheduledAt ? fmtDateTime(r.scheduledAt) : "—"}</td>
                    <td className="px-3 py-2.5">
                      {canEdit && (
                        <span className="flex flex-wrap justify-end gap-1.5">
                          {["draft", "paused"].includes(r.status) && <Link href={`/app/marketing/email-composer?id=${r.id}`} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Edit & Schedule</Link>}
                          {["draft", "scheduled"].includes(r.status) && <ActButton action={sendEmailNow.bind(null, r.id)} confirm="Send this campaign to its audience now?">Send Now</ActButton>}
                          {["sending", "scheduled"].includes(r.status) && <ActButton action={setEmailPaused.bind(null, r.id, true)}>Pause</ActButton>}
                          {r.status === "paused" && <ActButton action={setEmailPaused.bind(null, r.id, false)}>Resume</ActButton>}
                          <ActButton action={duplicateEmail.bind(null, r.id)}>Duplicate</ActButton>
                          <Link href={`?perf=${r.id}`} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Stats</Link>
                          {r.status !== "sending" && <ActButton action={deleteEmail.bind(null, r.id)} confirm="Delete this email campaign?">Delete</ActButton>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Mail} title={total ? "No email campaigns match these filters" : "No email campaigns yet"} body="Create your first email campaign when you are ready to send to a selected audience." action={total ? undefined : create(primarySm, "Create Email Campaign")} />
        )}
      </Panel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Deliverability & Performance"
          action={
            <form method="get" className="flex gap-1.5">
              <select name="perf" defaultValue={sp.perf ?? ""} aria-label="Campaign" className="h-9 rounded-md border border-line bg-white px-2 text-[12.5px]"><option value="">All Campaigns</option>{rows.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
              <button className="h-9 rounded-md border border-line px-3 text-[12px] font-semibold">Go</button>
            </form>
          }
        >
          {perf.sent ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[["Recipients", String(perf.sent)], ["Delivered", `${perf.delivered} (${pct(perf.delivered, perf.sent)})`], ["Opened", `${perf.opened} (${pct(perf.opened, perf.delivered) ?? "—"})`], ["Clicked", `${perf.clicked} (${pct(perf.clicked, perf.delivered) ?? "—"})`], ["Suppressed", String(perf.suppressed)], ["Not delivered", String(perf.failed)]].map(([l, v]) => (
                <li key={l} className="rounded-lg border border-line p-3"><div className="text-[12px] text-ink-muted">{l}</div><div className="mt-1 text-[16px] font-semibold text-deep-navy">{v}</div></li>
              ))}
              <li className="col-span-full text-[11.5px] text-ink-muted">Opens rely on image loading and are approximate.</li>
            </ul>
          ) : (
            <EmptyState icon={Activity} tone="violet" title="No performance data yet" body="Send your first campaign to see deliverability and performance insights." />
          )}
        </Panel>
        <Panel title="Recent Email Activity">
          {recent.length ? <ul className="divide-y divide-line">{recent.map((r) => <li key={r.id} className="flex justify-between gap-3 py-2 text-[13px]"><span className="text-deep-navy"><b>{r.name}</b> <span className="capitalize text-ink-soft">{r.action.replace(/_/g, " ")}</span></span><span className="shrink-0 text-[12px] text-ink-muted">{fmtDateTime(r.at)}</span></li>)}</ul> : <EmptyState icon={Mail} title="No recent activity" body="Your email campaign activity will appear here." />}
        </Panel>
      </div>
    </div>
  );
}
