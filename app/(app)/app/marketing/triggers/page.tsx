import type { Metadata } from "next";
import { Zap, Share2, CheckCircle2, XCircle, Clock, Target, Plus, Filter, Download, Play, Pencil, MoreHorizontal, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadTriggers, loadTriggerEvents } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Trigger / Event Manager" };
export const dynamic = "force-dynamic";

const SOURCES = [["Web Forms", 38.4, "#6A35F0"], ["Email", 24.7, "#EC4899"], ["Website", 16.9, "#16A56A"], ["CRM", 10.4, "#F59E0B"], ["Webhooks", 6.7, "#F97316"], ["Other", 2.9, "#94A3B8"]] as const;
const EXEC_STEPS = ["Event Received", "Conditions Checked", "Segment Matched", "Workflow Started", "Notification Sent", "CRM Updated"];
const BEST = [
  ["Define Clear Triggers", "Use specific event criteria to avoid unnecessary noise."],
  ["Validate Conditions", "Regularly review conditions and segments to keep automations accurate."],
  ["Monitor Performance", "Track success rates and response times for optimal performance."],
  ["Handle Failures", "Set up retries and notifications to resolve failures fast."],
] as const;

export default async function TriggersPage() {
  const [{ items: triggers, live }, { items: events, live: eventsLive }] = await Promise.all([loadTriggers(), loadTriggerEvents()]);
  const active = triggers.filter((t) => t.status === "Active").length;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Trigger / Event Manager"
        subtitle="Monitor triggers, event flows, and automation actions across your ecosystem."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Filter className="h-3.5 w-3.5" /> Filter</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Create Trigger</button>
          </>
        }
      />
      <MarketingSubnav />
      {live && <LiveBadge label={`Live · ${triggers.length} triggers from database`} />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={Zap} tone="violet" label="Active Triggers" value={String(active)} />
        <KpiCard icon={Share2} tone="blue" label="Events Processed" value={null} />
        <KpiCard icon={CheckCircle2} tone="green" label="Success Rate" value={null} />
        <KpiCard icon={XCircle} tone="red" label="Failed Events" value={null} deltaTone="down" />
        <KpiCard icon={Clock} tone="indigo" label="Avg. Response Time" value={null} deltaTone="down" />
        <KpiCard icon={Target} tone="teal" label="Automation Coverage" value={null} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="mb-2 text-[13px] font-bold text-ink">Event Activity Trend</div>
              <AreaChart data={[18, 22, 16, 24, 20, 28, 23, 30, 26, 32]} />
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="mb-2 text-[13px] font-bold text-ink">Trigger Performance by Source</div>
              <div className="flex items-center gap-4">
                <Donut segments={SOURCES.map(([, p, c]) => [p, c])} label="245,832" sub="Events" />
                <ul className="space-y-1 text-[11.5px]">
                  {SOURCES.map(([n, p, c]) => (
                    <li key={n} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} /><span className="text-ink-soft">{n}</span><span className="ml-auto font-semibold text-ink">{p}%</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="text-[13px] font-bold text-ink">Trigger Library / Rules</span><a className="text-[11px] font-semibold text-violet">View all</a></div>
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-line text-left text-[10.5px] uppercase tracking-wide text-ink-muted"><th className="px-4 py-2 font-semibold">Trigger</th><th className="px-2 py-2 font-semibold">Status</th><th className="px-2 py-2 font-semibold">Priority</th><th className="px-2 py-2 font-semibold">Source</th><th className="px-2 py-2 font-semibold">Last</th><th className="px-2 py-2" /></tr></thead>
                <tbody>
                  {triggers.map((t) => (
                    <tr key={t.id} className="border-b border-line/60 hover:bg-bg-soft/50">
                      <td className="px-4 py-2 font-medium text-ink">{t.name}</td>
                      <td className="px-2 py-2"><StatusPill tone={t.status === "Active" ? "green" : "gray"}>{t.status}</StatusPill></td>
                      <td className="px-2 py-2"><StatusPill tone={t.priority === "High" ? "orange" : t.priority === "Medium" ? "amber" : "blue"}>{t.priority}</StatusPill></td>
                      <td className="px-2 py-2 text-ink-soft">{t.source}</td>
                      <td className="px-2 py-2 text-ink-muted">{t.lastFired}</td>
                      <td className="px-2 py-2"><div className="flex gap-1 text-ink-muted"><Play className="h-3 w-3" /><Pencil className="h-3 w-3" /><MoreHorizontal className="h-3 w-3" /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="text-[13px] font-bold text-ink">Event Stream / Recent Events</span>{eventsLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}</div>
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-line text-left text-[10.5px] uppercase tracking-wide text-ink-muted"><th className="px-4 py-2 font-semibold">Time</th><th className="px-2 py-2 font-semibold">Event</th><th className="px-2 py-2 font-semibold">Workflow</th><th className="px-2 py-2 font-semibold">Result</th></tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b border-line/60 hover:bg-bg-soft/50">
                      <td className="px-4 py-2 text-ink-muted">{e.when}</td>
                      <td className="px-2 py-2 font-medium text-ink">{e.event}</td>
                      <td className="px-2 py-2 text-ink-soft">{e.workflow}</td>
                      <td className="px-2 py-2"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{e.result}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Execution steps */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-4 text-[13px] font-bold text-ink">Workflow Execution / Logic Steps</div>
            <div className="flex flex-wrap items-center gap-2">
              {EXEC_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${i < 5 ? "bg-emerald-500 text-white" : "border-2 border-ink/20 text-ink-muted"}`}>{i < 5 ? "✓" : i + 1}</div>
                    <span className="mt-1 max-w-[80px] text-center text-[10px] text-ink-soft">{s}</span>
                  </div>
                  {i < EXEC_STEPS.length - 1 && <div className="h-px w-8 bg-line" />}
                </div>
              ))}
            </div>
          </div>

          {/* Best practices */}
          <div className="grid gap-4 md:grid-cols-4">
            {BEST.map(([t, d], i) => (
              <div key={t} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className="text-[12.5px] font-bold text-ink">{i + 1}. {t}</div>
                <div className="mt-1 text-[11px] text-ink-muted">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-1 text-[13px] font-bold text-ink">AI Insights & Operations</div>
          </div>
          <SideCard icon={AlertTriangle} tone="red" title="Error Alerts" value="5" hint="5 triggers have errors in the last 24 hours." cta="View Error Logs" />
          <SideCard icon={Clock} tone="amber" title="Retry Queue" value="23" hint="23 events are queued for retry." cta="Manage Retry Queue" />
          <SideCard icon={CheckCircle2} tone="green" title="Webhook Health" value="98.6%" hint="All systems operational · checked 2m ago" cta="View Details" />
          <SideCard icon={Share2} tone="violet" title="Event Sources" value="18" hint="Connected sources across your ecosystem." cta="Manage Sources" />
        </div>
      </div>
    </div>
  );
}

function SideCard({ icon: Icon, tone, title, value, hint, cta }: { icon: typeof Clock; tone: string; title: string; value: string; hint: string; cta: string }) {
  const toneCls: Record<string, string> = { red: "bg-red-500/10 text-red-600", amber: "bg-amber-500/10 text-amber-600", green: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet/10 text-violet" };
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneCls[tone]}`}><Icon className="h-4 w-4" /></div><span className="text-[12.5px] font-bold text-ink">{title}</span></div>
        <span className="text-[16px] font-extrabold text-ink">{value}</span>
      </div>
      <div className="mt-1.5 text-[11px] text-ink-muted">{hint}</div>
      <a className="mt-1.5 inline-block text-[11px] font-semibold text-violet">{cta} →</a>
    </div>
  );
}

function Donut({ segments, label, sub }: { segments: [number, string][]; label: string; sub: string }) {
  let acc = 0;
  const grad = segments.map(([pct, color]) => { const s = acc; acc += pct; return `${color} ${s}% ${acc}%`; }).join(", ");
  return (
    <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${grad})` }}>
      <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white"><span className="text-[13px] font-extrabold text-ink">{label}</span><span className="text-[9px] text-ink-muted">{sub}</span></div>
    </div>
  );
}

function AreaChart({ data }: { data: number[] }) {
  const max = Math.max(...data) * 1.1, w = 320, h = 120, pad = 4;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (data.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polygon fill="url(#g)" points={`${pad},${h - pad} ${line} ${w - pad},${h - pad}`} />
      <polyline fill="none" stroke="#6A35F0" strokeWidth="2" points={line} />
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6A35F0" stopOpacity="0.25" /><stop offset="100%" stopColor="#6A35F0" stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
}
