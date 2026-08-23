import type { Metadata } from "next";
import { Plus, Filter, Search, MoreHorizontal, Upload } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { CAMPAIGN_STATUS_TONE } from "@/lib/marketing-auto-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { CAMPAIGN_FIELDS } from "@/components/amplivanta/crud/module-fields";
import { loadCampaigns } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Campaigns — Amplivanta" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { items: campaigns, live } = await loadCampaigns();
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Campaigns"
        subtitle="Manage multi-channel marketing campaigns and their performance."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Import</button>
            <ResourceDialog
              title="New Campaign"
              description="Launch a multi-channel campaign."
              fields={CAMPAIGN_FIELDS}
              endpoint="/api/campaigns"
              submitLabel="Create campaign"
              successMessage="Campaign created"
              trigger={<button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> New Campaign</button>}
            />
          </>
        }
      />
      <MarketingSubnav />
      {live && <LiveBadge label={`Live · ${campaigns.length} campaigns from database`} />}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search campaigns…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Types", "All Status", "All Owners"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-3 text-[12px] font-bold text-violet"><Filter className="h-3.5 w-3.5" /> More</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Reach</th>
              <th className="px-4 py-3 text-right">CTR</th>
              <th className="px-4 py-3 text-right">Conv.</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3">Goal Progress</th>
              <th className="px-4 py-3">Owner</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{c.channel.join(" · ")}</div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{c.type}</td>
                <td className="px-4 py-3"><StatusPill tone={CAMPAIGN_STATUS_TONE[c.status]}>{c.status}</StatusPill></td>
                <td className="px-4 py-3 text-right text-[12.5px]">{c.reach ? `${(c.reach / 1000).toFixed(1)}K` : "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{c.ctr ? `${c.ctr}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-ink">{c.conversions ? c.conversions.toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">{c.revenue ? `$${(c.revenue / 1000).toFixed(0)}K` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="text-[10.5px] text-ink-muted">{c.goal}</div>
                  <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${c.progress}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.owner} size={22} />
                    <span className="text-[11.5px] text-ink-soft">{c.owner.split(" ")[0]}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
