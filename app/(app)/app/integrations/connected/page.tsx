import type { Metadata } from "next";
import { Plus, Search, MoreHorizontal, Puzzle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { INTG_TONE } from "@/lib/integrations-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadIntegrations } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Connected Apps — Amplivanta" };
export const dynamic = "force-dynamic";

export default async function ConnectedAppsPage() {
  const { items: all, live } = await loadIntegrations();
  const items = all.filter((i) => i.status !== "Available");
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Connected Apps"
        subtitle="All workspace-connected applications and their synchronization health."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Add App</button>
        }
      />
      <IntegrationsSubnav />
      {live && <LiveBadge label={`Live · ${items.length} connected apps from database`} />}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search connected apps…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Status", "All Categories", "All Owners"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">App</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Scopes</th>
              <th className="px-4 py-3">Last Sync</th>
              <th className="px-4 py-3">Connected By</th>
              <th className="w-16 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-soft text-[18px]">{i.logo}</div>
                    <span className="text-[13px] font-semibold text-ink">{i.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{i.category}</td>
                <td className="px-4 py-3"><StatusPill tone={INTG_TONE[i.status]}>{i.status}</StatusPill></td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{i.scopes} scopes</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{i.lastSync}</td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{i.connectedBy || "—"}</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-lg border border-line px-2 py-1 text-[10.5px] font-semibold text-ink-soft">Configure</button>
                    {(i.status === "Warning" || i.status === "Error") && <button className="rounded-lg bg-amber-500 px-2 py-1 text-[10.5px] font-bold text-white">Reconnect</button>}
                    <button className="rounded-lg p-1 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
