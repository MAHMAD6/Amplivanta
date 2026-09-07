import type { Metadata } from "next";
import { Download, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { Avatar, StatusPill } from "@/components/amplivanta/status-pill";
import { ACTIVITY_LOG } from "@/lib/social-data";

export const metadata: Metadata = { title: "Social Activity Log" };

const CAT_TONE = { post: "violet", account: "blue", approval: "amber", settings: "gray" } as const;

export default function ActivityLogPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Activity Log"
        subtitle="Auditable history of Social Publishing actions."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-xl border border-line bg-white px-3">
        <Search className="h-3.5 w-3.5 text-ink-muted" />
        <input placeholder="Search events…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">IP / Device</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_LOG.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={e.actor} size={26} />
                      <span className="text-[13px] font-semibold text-ink">{e.actor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink"><span className="text-ink-soft">{e.action}</span> <span className="font-semibold">{e.object}</span></td>
                  <td className="px-4 py-3"><StatusPill tone={CAT_TONE[e.category]}>{e.category}</StatusPill></td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">{e.when}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">192.168.1.42 · macOS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
