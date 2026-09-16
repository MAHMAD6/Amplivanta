import type { Metadata } from "next";
import { Flag, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { DataTable, EmptyState, ScreenHeader, TabBar, fmtDate, fmtMoney } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { StatusSelect } from "@/components/amplivanta/workspace-ui";
import { createCampaign } from "@/app/(app)/app/workspace/actions";
import { CAMPAIGN_STATUSES } from "@/lib/workspace/options";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Campaign Plan" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/plan";

export default async function CampaignPlanPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const status = CAMPAIGN_STATUSES.some(([v]) => v === tab) ? tab! : null;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let rows: { id: string; name: string; objective: string | null; status: string; budget: number | null; startDate: Date | null; endDate: Date | null }[] = [];
  if (c) {
    try {
      rows = await db.campaign.findMany({ where: { workspaceId: c.workspaceId, ...(status ? { status } : {}) }, orderBy: { createdAt: "desc" }, take: 200, select: { id: true, name: true, objective: true, status: true, budget: true, startDate: true, endDate: true } });
    } catch {
      reachable = false;
    }
  }
  const create = (label: React.ReactNode, cls?: string) => (
    <FormDialog
      title="New Campaign"
      label={label}
      className={cls}
      action={createCampaign}
      disabled={!c?.canEdit}
      submitLabel="Create campaign"
      fields={[
        { name: "name", label: "Campaign name", kind: "text", required: true },
        { name: "objective", label: "Objective", kind: "text", placeholder: "e.g. Generate 200 qualified leads" },
        { name: "description", label: "Audience, channels and notes", kind: "textarea", rows: 3 },
        { name: "budget", label: "Budget (USD)", kind: "number" },
        { name: "startDate", label: "Start date", kind: "date" },
        { name: "endDate", label: "End date", kind: "date" },
      ]}
    />
  );
  const btn = "inline-flex h-11 items-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Campaign Plan"]]} title="Campaign Plan" subtitle="Plan and organize your marketing campaigns from strategy to execution." actions={create(<><Plus className="h-4 w-4" /> New Campaign</>, btn)} />
      <TabBar active={status ? `${BASE}?tab=${status}` : BASE} tabs={[["All Campaigns", BASE], ...CAMPAIGN_STATUSES.map(([v, l]) => [l, `${BASE}?tab=${v}`] as [string, string])]} />
      <section className="mb-5 min-h-[450px] rounded-xl border border-line bg-white p-5">
        <DataTable
          minWidth={820}
          columns={["Campaign", "Objective", "Budget", "Timeline", "Status"]}
          rows={rows.map((r) => [r.name, r.objective ?? "—", r.budget ? fmtMoney(r.budget) : "—", r.startDate ? `${fmtDate(r.startDate)} – ${r.endDate ? fmtDate(r.endDate) : "open"}` : "Not scheduled", <StatusSelect key="s" kind="campaign" id={r.id} value={r.status} options={CAMPAIGN_STATUSES.some(([v]) => v === r.status) ? CAMPAIGN_STATUSES : [[r.status, r.status], ...CAMPAIGN_STATUSES]} canEdit={Boolean(c?.canEdit)} />])}
          empty={<EmptyState icon={Flag} title={reachable ? (status ? "No campaigns in this stage" : "No campaigns yet") : "Campaigns unavailable"} body="Create your first campaign to start planning and tracking your marketing initiatives." action={reachable && !status ? create(<><Plus className="h-4 w-4" /> Create Campaign</>, btn) : undefined} />}
        />
      </section>
      <section className="rounded-xl border border-line bg-bg-soft/50 px-10 py-10">
        <h2 className="text-[22px] font-semibold text-deep-navy">Organize. Plan. Execute.</h2>
        <p className="mt-2 max-w-[520px] text-[15px] text-ink-soft">Use Campaign Plan to define objectives, audiences, channels, timelines, and budgets for every initiative.</p>
      </section>
    </div>
  );
}
