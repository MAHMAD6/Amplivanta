import type { Metadata } from "next";
import { Download, Eye, Users, MousePointer, Clock, Smartphone, Monitor, Tablet } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { TRAFFIC_KPIS, TRAFFIC_SOURCES, TRAFFIC_DEVICES, TRAFFIC_GEO, TRAFFIC_TOP_PAGES } from "@/lib/analytics-data";

export const metadata: Metadata = { title: "Traffic Analytics" };

const ICONS = [Eye, Users, MousePointer, Clock];
const TONES: any[] = ["violet", "blue", "pink", "green"];
const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet } as const;

export default function TrafficAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Traffic Analytics"
        subtitle="Volume, sources, devices, geography, engagement."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <AnalyticsSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TRAFFIC_KPIS.map((k, i) => <KpiCard key={k.label} icon={ICONS[i]} label={k.label} value={k.value} delta={k.delta} tone={TONES[i]} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">Traffic Sources</div>
          <div className="space-y-2">
            {TRAFFIC_SOURCES.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-soft">{s.name}</span>
                  <span><span className="font-bold text-ink">{s.sessions.toLocaleString()}</span> <span className="ml-1 text-emerald-600 font-semibold">↑ {s.delta}%</span></span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${s.share}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Devices</div>
          <div className="space-y-3">
            {TRAFFIC_DEVICES.map((d) => {
              const Icon = DEVICE_ICONS[d.name as keyof typeof DEVICE_ICONS];
              return (
                <div key={d.name} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold text-ink">{d.name}</div>
                    <div className="text-[10.5px] text-ink-muted">{d.sessions.toLocaleString()} sessions</div>
                  </div>
                  <span className="text-[15px] font-extrabold text-ink">{d.share}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Top Landing Pages</div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Path</th>
                <th className="pb-2 text-right">Sessions</th>
                <th className="pb-2 text-right">Bounce</th>
                <th className="pb-2 text-right">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {TRAFFIC_TOP_PAGES.map((p) => (
                <tr key={p.path} className="border-b border-line last:border-0">
                  <td className="py-2.5 font-mono text-[11.5px] text-ink">{p.path}</td>
                  <td className="py-2.5 text-right text-[12px] font-bold">{p.sessions.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-[12px]">{p.bounce}%</td>
                  <td className="py-2.5 text-right text-[12px]">{p.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Geography</div>
          <div className="space-y-2">
            {TRAFFIC_GEO.map((g) => (
              <div key={g.country}>
                <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-ink-soft">{g.country}</span><span><span className="font-bold text-ink">{g.sessions.toLocaleString()}</span> <span className="ml-1 text-ink-muted">({g.share}%)</span></span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-orange-brand" style={{ width: `${g.share}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
