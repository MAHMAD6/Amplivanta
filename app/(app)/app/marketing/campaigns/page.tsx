import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BarChart3, CalendarDays, FileText, LayoutGrid, Link2, List, Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, Panel, Pill, ScreenHeader, StatGrid, fmtDate, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, headerPrimary, outlineSm, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createCampaign, deleteCampaign, duplicateCampaign, importCampaigns, setCampaignStatus } from "@/app/(app)/app/marketing/actions";
import { marketingContext, memberNames } from "@/lib/server/marketing-screens";
import { CAMPAIGN_CHANNELS, CAMPAIGN_GOALS, CAMPAIGN_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; channel?: string; goal?: string; owner?: string; view?: string; c?: string };
const TONE: Record<string, "green" | "blue" | "gray" | "amber" | "violet"> = { active: "green", scheduled: "blue", planning: "gray", paused: "amber", completed: "violet", archived: "gray" };

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  type Row = { id: string; name: string; status: string; channel: string | null; goal: string | null; ownerId: string | null; startDate: Date | null; endDate: Date | null; budget: number | null; _count: { elements: number } };
  let rows: Row[] = [];
  let counts: Record<string, number> = {};
  let assets = 0;
  let members: { id: string; name: string }[] = [];
  let byChannel: [string, number][] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const [list, grouped, emails, elements, m, ch] = await Promise.all([
        db.campaign.findMany({
          where: { workspaceId: w, ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}), ...(sp.status ? { status: sp.status } : {}), ...(sp.channel ? { channel: sp.channel } : {}), ...(sp.goal ? { goal: sp.goal } : {}), ...(sp.owner ? { ownerId: sp.owner } : {}) },
          orderBy: { updatedAt: "desc" },
          take: 200,
          select: { id: true, name: true, status: true, channel: true, goal: true, ownerId: true, startDate: true, endDate: true, budget: true, _count: { select: { elements: true } } },
        }),
        db.campaign.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        db.emailCampaign.count({ where: { workspaceId: w, campaignId: { not: null } } }),
        db.campaignElement.count({ where: { campaign: { workspaceId: w } } }),
        memberNames(w),
        db.campaign.groupBy({ by: ["channel"], where: { workspaceId: w, status: { not: "archived" } }, _count: true }),
      ]);
      rows = list;
      counts = Object.fromEntries(grouped.map((g) => [g.status, g._count]));
      assets = emails + elements;
      members = m;
      byChannel = ch.map((x): [string, number] => [label(CAMPAIGN_CHANNELS, x.channel ?? "") === "—" ? "No channel" : label(CAMPAIGN_CHANNELS, x.channel), x._count]).sort((a, b) => b[1] - a[1]);
    } catch {
      rows = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const grid = sp.view === "grid";
  const base = Object.fromEntries(Object.entries({ q: sp.q, status: sp.status, channel: sp.channel, goal: sp.goal, owner: sp.owner }).filter(([, v]) => v)) as Record<string, string>;
  const owner = (id: string | null) => members.find((m) => m.id === id)?.name ?? "Unassigned";
  const createFields = [
    { name: "name", label: "Campaign name", kind: "text" as const, required: true },
    { name: "channel", label: "Channel", kind: "select" as const, options: CAMPAIGN_CHANNELS, placeholder: "Select" },
    { name: "goal", label: "Goal", kind: "select" as const, options: CAMPAIGN_GOALS, placeholder: "Select" },
    { name: "ownerId", label: "Owner", kind: "select" as const, options: members.map((m): [string, string] => [m.id, m.name]), placeholder: "Unassigned" },
    { name: "budget", label: "Budget (USD)", kind: "number" as const },
    { name: "startDate", label: "Start date", kind: "date" as const },
    { name: "endDate", label: "End date", kind: "date" as const },
    { name: "description", label: "Description", kind: "textarea" as const, rows: 3 },
  ];
  const create = (cls: string, text = "+ Create Campaign") => <FormDialog title="Create Campaign" label={text} className={cls} action={createCampaign} disabled={!canEdit} submitLabel="Create campaign" note="Campaigns start as drafts, or scheduled when the start date is in the future." fields={createFields} />;

  const actions = (x: Row) =>
    canEdit && (
      <span className="flex flex-wrap gap-1.5">
        {x.status !== "active" && x.status !== "archived" && <ActButton action={setCampaignStatus.bind(null, x.id, "active")}>Activate</ActButton>}
        {x.status === "active" && <ActButton action={setCampaignStatus.bind(null, x.id, "paused")}>Pause</ActButton>}
        {x.status === "active" && <ActButton action={setCampaignStatus.bind(null, x.id, "completed")}>Complete</ActButton>}
        {x.status !== "archived" ? <ActButton action={setCampaignStatus.bind(null, x.id, "archived")}>Archive</ActButton> : <ActButton action={setCampaignStatus.bind(null, x.id, "planning")}>Restore</ActButton>}
        <ActButton action={duplicateCampaign.bind(null, x.id)}>Duplicate</ActButton>
        <ActButton action={deleteCampaign.bind(null, x.id)} confirm="Delete this campaign?">Delete</ActButton>
      </span>
    );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Campaigns"]]}
        title="Campaigns"
        actions={
          <>
            {create(headerPrimary)}
            <FormDialog title="Import Campaigns" label="Import Campaign" className={headerOutline} action={importCampaigns} disabled={!canEdit} submitLabel="Import" note="Header row required: name, channel, goal, start_date, end_date, budget. Channels: email, social, landing_page, paid, multi. Up to 200 rows; all import as drafts." fields={[{ name: "csv", label: "CSV", kind: "textarea", rows: 8, required: true, placeholder: "name,channel,goal,start_date,end_date,budget\nSpring launch,email,leads,2026-10-01,2026-10-31,5000" }]} />
          </>
        }
      />
      <StatGrid
        cols={5}
        stats={[
          { label: "Active Campaigns", icon: Megaphone, value: figure(counts.active), hint: counts.active ? "Running now" : " " },
          { label: "Scheduled", icon: CalendarDays, value: figure(counts.scheduled), hint: " ", tone: "green" },
          { label: "Drafts", icon: FileText, value: figure(counts.planning), hint: " ", tone: "violet" },
          { label: "Archived", icon: Archive, value: figure(counts.archived), hint: " ", tone: "orange" },
          { label: "Connected Assets", icon: Link2, value: figure(assets), hint: assets ? "Emails and elements linked" : " ", tone: "teal" },
        ]}
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search campaigns..." aria-label="Search campaigns" className={filterSearch} />
        <Select name="status" value={sp.status} all="Status" options={CAMPAIGN_STATUSES} label="Status" />
        <Select name="channel" value={sp.channel} all="Channel" options={CAMPAIGN_CHANNELS} label="Channel" />
        <Select name="goal" value={sp.goal} all="Goal" options={CAMPAIGN_GOALS} label="Goal" />
        <Select name="owner" value={sp.owner} all="Owner" options={members.map((m) => [m.id, m.name])} label="Owner" />
        {grid && <input type="hidden" name="view" value="grid" />}
        <span className="ml-auto flex gap-1">
          <Link aria-label="List view" href={`?${new URLSearchParams(base)}`} className={cn("rounded-md border p-2", !grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><List className="h-4 w-4" /></Link>
          <Link aria-label="Grid view" href={`?${new URLSearchParams({ ...base, view: "grid" })}`} className={cn("rounded-md border p-2", grid ? "border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "border-line text-ink-muted")}><LayoutGrid className="h-4 w-4" /></Link>
        </span>
      </FilterBar>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          {!rows.length ? (
            <EmptyState icon={Megaphone} title={total ? "No campaigns match these filters" : "No campaigns yet"} body="Create your first campaign to organize channels, assets, goals, and execution." action={total ? undefined : <span className="flex gap-2">{create(primarySm, "Create Campaign")}<Link href="/app/marketing/templates" className={outlineSm}>Explore Templates</Link></span>} />
          ) : grid ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rows.map((x) => (
                <div key={x.id} className={cn("rounded-xl border p-4", sp.c === x.id ? "border-[#0B5CFF]" : "border-line")}>
                  <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-deep-navy">{x.name}</h3><Pill tone={TONE[x.status] ?? "gray"}>{label(CAMPAIGN_STATUSES, x.status)}</Pill></div>
                  <p className="mt-1 text-[12.5px] text-ink-soft">{label(CAMPAIGN_CHANNELS, x.channel)} · {label(CAMPAIGN_GOALS, x.goal)} · {owner(x.ownerId)}</p>
                  <p className="mt-1 text-[12px] text-ink-muted">{fmtDate(x.startDate)} – {fmtDate(x.endDate)}{x.budget ? ` · $${x.budget.toLocaleString()}` : ""}</p>
                  <div className="mt-3">{actions(x)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Campaign", "Channel", "Goal", "Owner", "Dates", "Budget", "Status", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id} className={cn("border-b border-line last:border-0", sp.c === x.id && "bg-royal-tint/30")}>
                      <td className="px-3 py-2.5 font-semibold text-deep-navy">{x.name}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{label(CAMPAIGN_CHANNELS, x.channel)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{label(CAMPAIGN_GOALS, x.goal)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{owner(x.ownerId)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{fmtDate(x.startDate)} – {fmtDate(x.endDate)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{x.budget ? `$${x.budget.toLocaleString()}` : "—"}</td>
                      <td className="px-3 py-2.5"><Pill tone={TONE[x.status] ?? "gray"}>{label(CAMPAIGN_STATUSES, x.status)}</Pill></td>
                      <td className="px-3 py-2.5">{actions(x)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <div className="space-y-4">
          <Panel title="Campaign Insights">
            {total ? (
              <>
                <BarList rows={CAMPAIGN_STATUSES.map(([k, l]): [string, number] => [l, counts[k] ?? 0]).filter(([, v]) => v > 0)} />
                {byChannel.length > 0 && <><h3 className="mb-2 mt-4 text-[13px] font-semibold text-deep-navy">By channel</h3><BarList rows={byChannel} /></>}
              </>
            ) : (
              <EmptyState icon={BarChart3} tone="violet" title="No insights to display yet" body="Create or activate campaigns to see performance insights and trends here." action={<Link href="/app/marketing" className={outlineSm}>Go to Dashboard</Link>} />
            )}
          </Panel>
          <Panel title="Campaign Templates">
            <EmptyState icon={FileText} tone="violet" title="Launch faster with templates" body="Automation and landing page templates create editable drafts you can attach to a campaign." action={<span className="flex flex-wrap justify-center gap-2"><Link href="/app/marketing/templates" className={outlineSm}>Browse Templates</Link><Link href="/app/marketing/landing-page-templates" className={outlineSm}>Page Templates</Link></span>} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
