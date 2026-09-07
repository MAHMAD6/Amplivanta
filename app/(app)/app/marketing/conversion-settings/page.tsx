import type { Metadata } from "next";
import { Plus, Target, TrendingUp, PieChart, DollarSign, Play, Eye, MoreHorizontal, Code2, Server, Tag } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadConversions } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Conversion Settings" };
export const dynamic = "force-dynamic";

const TABS = ["Conversion Events", "Goals", "Revenue Tracking", "Attribution Windows", "Settings"];

export default async function ConversionSettingsPage() {
  const { items: rows, live } = await loadConversions();
  const totalConv = rows.reduce((s, r) => s + r.conversions, 0);
  const activeCount = rows.filter((r) => r.status === "Active").length;
  const avgRate = Math.round((rows.reduce((s, r) => s + r.rate, 0) / Math.max(rows.length, 1)) * 100) / 100;
  const revenue = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Conversion Settings"
        subtitle="Track what matters. Measure conversions accurately across your campaigns and channels."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Eye className="h-3.5 w-3.5" /> View Conversion Events ({rows.length})</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Create Conversion</button>
          </>
        }
      />
      <MarketingSubnav />
      {live && <LiveBadge label={`Live · ${rows.length} conversion events from database`} />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Target} tone="violet" label="Active Conversions" value={String(activeCount)} />
        <KpiCard icon={TrendingUp} tone="green" label="Total Conversions" value={totalConv.toLocaleString()} />
        <KpiCard icon={PieChart} tone="blue" label="Avg. Conversion Rate" value={`${avgRate}%`} />
        <KpiCard icon={DollarSign} tone="orange" label="Revenue Attributed" value={`$${revenue.toLocaleString()}`} />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="flex gap-1 border-b border-line px-4">
          {TABS.map((t, i) => (
            <button key={t} className={`relative px-3 py-3 text-[13px] font-semibold ${i === 0 ? "text-violet" : "text-ink-soft hover:text-ink"}`}>
              {t}
              {i === 0 && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <input placeholder="Search conversions…" className="h-9 w-64 rounded-xl border border-line bg-bg-soft px-3 text-[13px] focus:outline-none" />
          <div className="flex gap-2">
            <select className="h-9 rounded-xl border border-line bg-white px-3 text-[12.5px]"><option>All Status</option></select>
            <select className="h-9 rounded-xl border border-line bg-white px-3 text-[12.5px]"><option>All Types</option></select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-2.5 font-semibold">Conversion Name</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Source</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Conversions</th>
                <th className="px-3 py-2.5 font-semibold">Rate</th>
                <th className="px-3 py-2.5 font-semibold">Value</th>
                <th className="px-3 py-2.5 font-semibold">Last Triggered</th>
                <th className="px-3 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 hover:bg-bg-soft/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{r.name}</div>
                    <div className="text-[11px] text-ink-muted">{r.hint}</div>
                  </td>
                  <td className="px-3 py-3"><StatusPill tone={r.type === "Website" ? "violet" : r.type === "Form" ? "blue" : "amber"}>{r.type}</StatusPill></td>
                  <td className="px-3 py-3 text-ink-soft">{r.source}</td>
                  <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${r.status === "Active" ? "text-emerald-600" : "text-orange-brand"}`}><span className={`h-1.5 w-1.5 rounded-full ${r.status === "Active" ? "bg-emerald-500" : "bg-orange-brand"}`} />{r.status}</span></td>
                  <td className="px-3 py-3"><div className="font-semibold text-ink">{r.conversions.toLocaleString()}</div><div className={`text-[11px] ${r.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{r.delta >= 0 ? "+" : ""}{r.delta}%</div></td>
                  <td className="px-3 py-3"><div className="font-semibold text-ink">{r.rate}%</div></td>
                  <td className="px-3 py-3 font-semibold text-ink">${r.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-3 text-ink-muted">{r.lastTriggered}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] font-semibold text-ink hover:border-violet/40"><Play className="h-3 w-3" /> Test</button>
                      <button className="text-ink-muted hover:text-ink"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="text-ink-muted hover:text-ink"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[12px] text-ink-muted">
          <span>Showing 1 to {rows.length} of {rows.length} conversions</span>
          <div className="flex gap-1"><button className="h-7 w-7 rounded-lg bg-violet text-[12px] font-bold text-white">1</button><button className="h-7 w-7 rounded-lg border border-line text-[12px]">2</button><button className="h-7 w-7 rounded-lg border border-line text-[12px]">3</button></div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Tracking Methods</div>
          <div className="space-y-3">
            <TrackRow icon={Code2} name="JavaScript Pixel" hint="Add our tracking code to your website" />
            <TrackRow icon={Server} name="Server-Side API" hint="Send conversion data from your server" />
            <TrackRow icon={Tag} name="Google Tag Manager" hint="Manage conversions via GTM" />
          </div>
          <a className="mt-3 inline-block text-[12px] font-semibold text-violet">View Tracking Guide →</a>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Attribution & Window</div>
          <dl className="space-y-2.5 text-[13px]">
            <AttrRow label="Attribution Model" value="Data-Driven" />
            <AttrRow label="Conversion Window" value="30 Days" />
            <AttrRow label="View-Through Window" value="1 Day" />
            <AttrRow label="Cross-Device Tracking" value="Enabled" tone />
          </dl>
          <a className="mt-3 inline-block text-[12px] font-semibold text-violet">Edit Attribution Settings →</a>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Recommended Actions</span><StatusPill tone="violet">2</StatusPill></div>
          <div className="space-y-3">
            <RecRow name="Enable revenue tracking for 3 events" hint="Track the monetary value of conversions" cta="Review" />
            <RecRow name="Add conversion for pricing page visits" hint="Track high-intent visitors" cta="Add Conversion" />
          </div>
          <a className="mt-3 inline-block text-[12px] font-semibold text-violet">View All Recommendations →</a>
        </div>
      </div>
    </div>
  );
}

function TrackRow({ icon: Icon, name, hint }: { icon: typeof Code2; name: string; hint: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-ink">{name}</div><div className="text-[11px] text-ink-muted">{hint}</div></div>
      <StatusPill tone="green">Active</StatusPill>
    </div>
  );
}
function AttrRow({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return <div className="flex items-center justify-between"><dt className="text-ink-soft">{label}</dt><dd className={tone ? "" : "font-semibold text-violet"}>{tone ? <StatusPill tone="green">{value}</StatusPill> : value}</dd></div>;
}
function RecRow({ name, hint, cta }: { name: string; hint: string; cta: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div><div className="text-[12.5px] font-semibold text-ink">{name}</div><div className="text-[11px] text-ink-muted">{hint}</div></div>
      <button className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[11px] font-semibold text-ink hover:border-violet/40">{cta}</button>
    </div>
  );
}
