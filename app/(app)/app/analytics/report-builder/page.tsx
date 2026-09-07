import type { Metadata } from "next";
import { Share2, CalendarClock, Download, Undo2, Redo2, History, MoreHorizontal, Monitor, Tablet, Smartphone, Grid3x3, LayoutGrid, BarChart3, LineChart as LineIcon, AreaChart, PieChart, Filter as FunnelIcon, Table2, Trophy, ClipboardList, Type, Image as ImageIcon, Gauge, GripVertical, Settings2, Copy, Trash2, AlertTriangle, CheckCircle2, Users2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "Report Builder" };

const WIDGETS = [
  ["KPI Card", Gauge], ["Line Chart", LineIcon], ["Bar Chart", BarChart3], ["Area Chart", AreaChart], ["Donut Chart", PieChart], ["Funnel", FunnelIcon], ["Table", Table2], ["Attribution Chart", Share2], ["Leaderboard", Trophy], ["Scorecard", ClipboardList], ["Text Block", Type], ["Image", ImageIcon],
] as const;
const KPIS = [["Total Revenue", "$1.24M", "12.6%"], ["New Leads", "2,543", "18.3%"], ["Conversion Rate", "4.32%", "6.7%"], ["ROI", "3.21x", "9.1%"]] as const;
const CHANNELS = [["Paid Search", 42, "#6A35F0"], ["Social", 24, "#EC4899"], ["Email", 16, "#3B82F6"], ["Direct", 10, "#14B8A6"], ["Referral", 8, "#F59E0B"]] as const;
const COLLAB = [["Amanda Johnson (You)", "Owner"], ["Michael Chen", "Editor"], ["Sarah Williams", "Viewer"], ["David Kim", "Viewer"]] as const;

export default function ReportBuilderPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Report Builder"
        subtitle="Create, customize, and share performance reports."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Share2 className="h-3.5 w-3.5" /> Share</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><CalendarClock className="h-3.5 w-3.5" /> Schedule</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">Save &amp; Publish</button>
          </>
        }
      />
      <AnalyticsSubnav />

      {/* Report meta bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold text-ink">Executive Performance Overview</span>
          <StatusPill tone="gray">Draft</StatusPill>
          <span className="text-[11.5px] text-ink-muted">Data source: All Sources · <span className="text-emerald-600">Connected</span> · Last sync: 2 min ago</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink-soft">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Autosaved just now</span>
          <button className="rounded-lg p-1.5 hover:bg-bg-soft"><Undo2 className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 hover:bg-bg-soft"><Redo2 className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold"><History className="h-3.5 w-3.5" /> Version history</button>
          <button className="rounded-lg p-1.5 hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[220px_1fr_280px]">
        {/* Widget library */}
        <div className="rounded-2xl border border-line bg-white p-3 shadow-card">
          <div className="mb-2 flex gap-3 border-b border-line pb-2 text-[12.5px] font-semibold"><span className="text-violet">Widgets</span><span className="text-ink-muted">Layout</span></div>
          <input placeholder="Search widgets" className="mb-2 h-8 w-full rounded-lg border border-line bg-bg-soft px-2.5 text-[12px] focus:outline-none" />
          <div className="mb-2 flex flex-wrap gap-1 text-[10.5px]">{["All", "Charts", "Tables", "KPIs", "Text"].map((t, i) => <span key={t} className={`rounded-full px-2 py-0.5 font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "bg-bg-soft text-ink-muted"}`}>{t}</span>)}</div>
          <div className="space-y-1">
            {WIDGETS.map(([name, Icon]) => (
              <div key={name} className="flex cursor-grab items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-[12px] font-medium text-ink hover:border-violet/40 hover:bg-violet/[0.03]">
                <Icon className="h-4 w-4 text-violet" /> <span className="flex-1">{name}</span> <GripVertical className="h-3.5 w-3.5 text-ink-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="rounded-2xl border border-line bg-bg-soft/40 p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-0.5">
              <button className="rounded-md bg-violet/10 p-1.5 text-violet"><Monitor className="h-4 w-4" /></button>
              <button className="rounded-md p-1.5 text-ink-muted"><Tablet className="h-4 w-4" /></button>
              <button className="rounded-md p-1.5 text-ink-muted"><Smartphone className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-ink-soft">
              <span className="inline-flex items-center gap-1"><Grid3x3 className="h-3.5 w-3.5" /> Grid</span>
              <span className="inline-flex items-center gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Snap to grid</span>
              <select className="h-7 rounded-lg border border-line bg-white px-2 text-[11px]"><option>12 columns</option></select>
            </div>
          </div>

          {/* KPI row */}
          <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KPIS.map(([label, val, delta]) => (
              <div key={label} className="rounded-xl border border-line bg-white p-3 shadow-card">
                <div className="flex items-center gap-1 text-[11px] text-ink-muted"><GripVertical className="h-3 w-3" /> {label}</div>
                <div className="mt-1 text-[20px] font-extrabold text-ink">{val}</div>
                <div className="text-[11px] font-semibold text-emerald-600">▲ {delta} vs May 1 – Apr 30</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border-2 border-dashed border-violet/50 bg-white p-4 shadow-card">
              <div className="mb-1 text-[12.5px] font-bold text-ink">Revenue Over Time</div>
              <MiniLine />
            </div>
            <div className="rounded-xl border border-line bg-white p-4 shadow-card">
              <div className="mb-1 text-[12.5px] font-bold text-ink">Leads by Source</div>
              <MiniBars />
            </div>
            <div className="rounded-xl border border-line bg-white p-4 shadow-card">
              <div className="mb-2 text-[12.5px] font-bold text-ink">Top Campaigns</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]"><thead><tr className="text-left text-ink-muted"><th className="py-1 font-semibold">Campaign</th><th className="py-1 font-semibold">Clicks</th><th className="py-1 font-semibold">Revenue</th></tr></thead>
                  <tbody>{[["Spring Promotion", "8,742", "$345,320"], ["Brand Awareness", "6,281", "$178,540"], ["Lead Gen Q2", "5,932", "$154,870"]].map((r) => <tr key={r[0]} className="border-t border-line/60"><td className="py-1 font-medium text-ink">{r[0]}</td><td className="py-1">{r[1]}</td><td className="py-1">{r[2]}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-white p-4 shadow-card">
              <div className="mb-2 text-[12.5px] font-bold text-ink">Revenue by Channel</div>
              <div className="flex items-center gap-3">
                <Donut segments={CHANNELS.map(([, p, c]) => [p, c])} />
                <ul className="space-y-1 text-[10.5px]">{CHANNELS.map(([n, p, c]) => <li key={n} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} /><span className="text-ink-soft">{n}</span><span className="ml-auto font-semibold text-ink">{p}%</span></li>)}</ul>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="mb-3 flex gap-3 border-b border-line pb-2 text-[12px] font-semibold"><span className="text-violet">Data</span><span className="text-ink-muted">Style</span><span className="text-ink-muted">Filters</span><span className="text-ink-muted">Permissions</span></div>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-bg-soft/60 p-2.5"><div className="flex items-center gap-2"><LineIcon className="h-4 w-4 text-violet" /><div><div className="text-[12.5px] font-semibold text-ink">Revenue Over Time</div><div className="text-[10.5px] text-ink-muted">Line Chart</div></div></div><button className="text-[10.5px] font-semibold text-violet">Change widget</button></div>
          <Field label="Data source" value="All Sources" />
          <Field label="Metric" value="Total Revenue" />
          <Field label="Date range" value="Custom" />
          <div className="mb-3 grid grid-cols-2 gap-2"><Field label="From" value="May 1, 2025" /><Field label="To" value="May 31, 2025" /></div>
          <label className="mb-3 flex items-center gap-2 text-[12px] text-ink-soft"><input type="checkbox" defaultChecked className="accent-violet" /> Compare to previous period</label>
          <Field label="Aggregation" value="Daily" />
          <div className="mt-4 border-t border-line pt-3">
            <div className="mb-2 flex items-center justify-between text-[12px] font-bold text-ink"><span>Filters</span><StatusPill tone="violet">2 active</StatusPill></div>
            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex items-center justify-between rounded-lg border border-line px-2.5 py-1.5"><span className="text-ink-soft">Country is United States</span></div>
              <div className="flex items-center justify-between rounded-lg border border-line px-2.5 py-1.5"><span className="text-ink-soft">Campaign Status is Active</span></div>
            </div>
          </div>
          <div className="mt-4 flex gap-2 border-t border-line pt-3">
            <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-line py-2 text-[11.5px] font-semibold text-ink hover:border-violet/40"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
            <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-line py-2 text-[11.5px] font-semibold text-red-600 hover:border-red-400"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </div>
      </div>

      {/* Bottom rail */}
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-ink"><AlertTriangle className="h-4 w-4 text-amber-500" /> Validation <StatusPill tone="amber">2 issues</StatusPill></div>
          <ul className="space-y-2 text-[11.5px] text-ink-soft"><li><b className="text-ink">Data freshness</b> — HubSpot data is 15m old.</li><li><b className="text-ink">Missing filter</b> — Add a date filter for accurate results.</li></ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-ink"><CalendarClock className="h-4 w-4 text-violet" /> Schedule</div>
          <ul className="space-y-1.5 text-[11.5px] text-ink-soft"><li>Next delivery — Jun 2, 2025 at 8:00 AM</li><li>Frequency — Weekly on Monday</li></ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-ink"><Users2 className="h-4 w-4 text-violet" /> Collaborators</div>
          <ul className="space-y-1.5 text-[11.5px]">{COLLAB.map(([n, role]) => <li key={n} className="flex items-center justify-between"><span className="text-ink-soft">{n}</span><span className="text-ink-muted">{role}</span></li>)}</ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-ink"><Settings2 className="h-4 w-4 text-violet" /> Activity Log</div>
          <ul className="space-y-1.5 text-[11px] text-ink-soft"><li>Amanda Johnson published version 3</li><li>Michael Chen updated Revenue widget</li><li>Sarah Williams commented on Top Campaigns</li></ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="mb-3 block"><span className="mb-1 block text-[11px] font-semibold text-ink">{label}</span><div className="flex h-9 items-center rounded-lg border border-line bg-white px-2.5 text-[12px] text-ink-soft">{value}</div></label>;
}
function Donut({ segments }: { segments: [number, string][] }) {
  let acc = 0;
  const grad = segments.map(([pct, color]) => { const s = acc; acc += pct; return `${color} ${s}% ${acc}%`; }).join(", ");
  return <div className="h-20 w-20 shrink-0 rounded-full" style={{ background: `conic-gradient(${grad})` }}><div className="m-[26%] h-[48%] w-[48%] rounded-full bg-white" /></div>;
}
function MiniLine() {
  const d = [40, 55, 48, 62, 58, 72, 68, 80, 76, 88], max = 100, w = 300, h = 90, pad = 4;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (d.length - 1), y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  return <svg viewBox={`0 0 ${w} ${h}`} className="w-full"><polyline fill="none" stroke="#6A35F0" strokeWidth="2" points={d.map((v, i) => `${x(i)},${y(v)}`).join(" ")} /></svg>;
}
function MiniBars() {
  const d = [30, 24, 18, 14, 9];
  return <div className="flex h-[90px] items-end gap-3 px-2">{d.map((v, i) => <div key={i} className="flex-1 rounded-t bg-violet/70" style={{ height: `${(v / 30) * 100}%` }} />)}</div>;
}
