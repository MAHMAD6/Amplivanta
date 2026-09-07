import type { Metadata } from "next";
import { Search, Filter, Download } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { WS_ACTIVITY } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Workspace Activity" };

const CAT_TONE = { Create: "blue", Edit: "gray", Approve: "green", Publish: "violet", Budget: "orange", Integration: "teal", AI: "pink" } as const;
const CATS = ["All", "Create", "Edit", "Approve", "Publish", "Budget", "Integration", "AI"];

const topUsers = [
  { name: "Emily Davis", actions: 42 },
  { name: "Alex Johnson", actions: 38 },
  { name: "Sarah Chen", actions: 34 },
  { name: "Marcus Lee", actions: 24 },
  { name: "Priya Ramesh", actions: 18 },
];

export default function WSActivityPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Activity / History"
        subtitle="Chronological, filterable audit trail for workspace activity."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search actors, objects, keywords…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {CATS.map((c, i) => (
          <button key={c} className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{c}</button>
        ))}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" /> More</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {WS_ACTIVITY.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><Avatar name={a.actor} size={22} /><span className="text-[12.5px] font-semibold text-ink">{a.actor}</span></div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink"><span className="text-ink-soft">{a.verb}</span> <span className="font-semibold">{a.object}</span></td>
                    <td className="px-4 py-3 text-[11.5px] text-ink-muted">{a.module}</td>
                    <td className="px-4 py-3"><StatusPill tone={CAT_TONE[a.category]}>{a.category}</StatusPill></td>
                    <td className="px-4 py-3 text-[11.5px] text-ink-muted">{a.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Activity Summary (30d)</div>
            <div className="space-y-2 text-[12px]">
              {[
                { l: "Total events", v: "1,428" },
                { l: "Publish events", v: "128" },
                { l: "Approvals", v: "342" },
                { l: "AI events", v: "620" },
                { l: "Budget changes", v: "18" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between border-b border-line pb-1.5 last:border-0"><span className="text-ink-soft">{r.l}</span><span className="font-bold text-ink">{r.v}</span></div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Top Users</div>
            <div className="space-y-2">
              {topUsers.map((u) => (
                <div key={u.name} className="flex items-center gap-2">
                  <Avatar name={u.name} size={22} />
                  <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold text-ink">{u.name}</div></div>
                  <span className="text-[11.5px] font-bold text-ink">{u.actions}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
