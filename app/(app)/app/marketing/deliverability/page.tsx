import type { Metadata } from "next";
import { ShieldCheck, Inbox, MailWarning, AlertTriangle, Award, BadgeCheck, Play, Filter, Download } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadDeliverability } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Email Deliverability" };
export const dynamic = "force-dynamic";

const AUTH = [
  ["SPF", "Verified", "green"], ["DKIM", "Verified", "green"], ["DMARC", "Quarantine", "amber"],
  ["BIMI", "Needs Setup", "orange"], ["Custom Tracking Domain", "Verified", "green"], ["Reverse DNS", "Verified", "green"],
] as const;
const REPUTATION = [["Domain Reputation", "Good"], ["IP Reputation", "Good"], ["Blocklist Monitoring", "Clean"], ["Complaint Risk", "Low"]] as const;
const PROVIDERS = [
  ["Gmail", 89.2, 28.4, 0.4, "Good"], ["Outlook", 86.1, 25.7, 0.6, "Good"], ["Yahoo", 84.9, 24.1, 0.8, "Good"], ["Apple Mail", 90.3, 31.1, 0.3, "Excellent"],
] as const;
const RECS = [
  ["Improve DMARC alignment", "Move policy to reject for stronger protection.", "High Impact"],
  ["Slow down sending ramp-up", "Increase gradual sending to avoid reputation spikes.", "Medium Impact"],
  ["Clean inactive contacts", "Remove inactive subscribers to reduce bounces.", "High Impact"],
  ["Separate promotional segments", "Better segmentation can improve inbox placement.", "Medium Impact"],
] as const;
const STEPS = [
  ["Authenticate Domain", "Set up SPF, DKIM, DMARC and verify your domain."],
  ["Warm Up IP & Domain", "Gradually increase volume to build reputation."],
  ["Monitor Reputation", "Track inbox placement, complaints, and blocklists."],
  ["Clean Your Lists", "Remove inactive and risky contacts regularly."],
  ["Optimize Content", "Create relevant content and test subject lines."],
] as const;

export default async function DeliverabilityPage() {
  const { items: campaigns, live } = await loadDeliverability();
  const avgInbox = Math.round((campaigns.reduce((s, c) => s + c.inboxRate, 0) / Math.max(campaigns.length, 1)) * 10) / 10;
  const avgBounce = Math.round((campaigns.reduce((s, c) => s + c.bounceRate, 0) / Math.max(campaigns.length, 1)) * 100) / 100;
  const avgSpam = Math.round((campaigns.reduce((s, c) => s + c.spamRate, 0) / Math.max(campaigns.length, 1)) * 100) / 100;
  const score = Math.round(avgInbox);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Email Deliverability"
        subtitle="Monitor inbox placement, sender reputation, and authentication to improve performance and build trust."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Play className="h-3.5 w-3.5" /> Run Deliverability Test</button>
          </>
        }
      />
      <MarketingSubnav />
      {live && <LiveBadge label={`Live · ${campaigns.length} campaigns from database`} />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={ShieldCheck} tone="violet" label="Deliverability Score" value={`${score}/100`} />
        <KpiCard icon={Inbox} tone="blue" label="Inbox Placement Rate" value={`${avgInbox}%`} />
        <KpiCard icon={MailWarning} tone="teal" label="Bounce Rate" value={`${avgBounce}%`} deltaTone="down" />
        <KpiCard icon={AlertTriangle} tone="orange" label="Spam Complaint Rate" value={`${avgSpam}%`} deltaTone="down" />
        <KpiCard icon={Award} tone="indigo" label="Sender Reputation" value={null} deltaTone="neutral" />
        <KpiCard icon={BadgeCheck} tone="green" label="Auth Coverage" value={null} deltaTone="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Trend charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Inbox Placement Trend" series={[["Inbox", "#16A56A", [86, 89, 87, 88, 90, 88, 89]], ["Promotions", "#3B82F6", [10, 8, 11, 9, 7, 9, 8]], ["Spam", "#EF4444", [3, 2, 2, 3, 2, 2, 2]]]} />
            <ChartCard title="Engagement vs Bounce" series={[["Open", "#7C3AED", [28, 31, 27, 29, 26, 30, 31]], ["Click", "#3B82F6", [11, 12, 10, 11, 12, 10, 12]], ["Bounce", "#EF4444", [1, 1, 1.2, 0.9, 1, 0.8, 1]]]} />
          </div>

          {/* Auth / reputation / providers */}
          <div className="grid gap-4 md:grid-cols-3">
            <Panel title="Authentication & Domain Setup">
              {AUTH.map(([k, v, tone]) => (
                <div key={k} className="flex items-center justify-between py-1 text-[12.5px]"><span className="text-ink-soft">{k}</span><StatusPill tone={tone}>{v}</StatusPill></div>
              ))}
            </Panel>
            <Panel title="Sender Reputation">
              {REPUTATION.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-[12.5px]"><span className="text-ink-soft">{k}</span><StatusPill tone="green">{v}</StatusPill></div>
              ))}
              <div className="mt-2 flex items-center justify-between py-1 text-[12.5px]"><span className="text-ink-soft">Warm-up Status</span><span className="font-semibold text-ink">78%</span></div>
            </Panel>
            <Panel title="Mailbox Provider Performance">
              <table className="w-full text-[11.5px]">
                <thead><tr className="text-left text-ink-muted"><th className="py-1 font-semibold">Provider</th><th className="py-1 font-semibold">Inbox</th><th className="py-1 font-semibold">Open</th><th className="py-1 font-semibold">Status</th></tr></thead>
                <tbody>
                  {PROVIDERS.map(([p, inbox, open, , st]) => (
                    <tr key={p} className="border-t border-line/60"><td className="py-1.5 font-medium text-ink">{p}</td><td className="py-1.5">{inbox}%</td><td className="py-1.5">{open}%</td><td className="py-1.5"><StatusPill tone={st === "Excellent" ? "green" : "green"}>{st}</StatusPill></td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Campaign table */}
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <div className="border-b border-line px-4 py-3 text-[13px] font-bold text-ink">Recent Campaign Deliverability</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-2 font-semibold">Campaign</th><th className="px-3 py-2 font-semibold">Sent</th><th className="px-3 py-2 font-semibold">Delivered</th><th className="px-3 py-2 font-semibold">Inbox %</th><th className="px-3 py-2 font-semibold">Open %</th><th className="px-3 py-2 font-semibold">Bounce %</th><th className="px-3 py-2 font-semibold">Status</th>
                </tr></thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-line/60 hover:bg-bg-soft/50">
                      <td className="px-4 py-2.5 font-medium text-ink">{c.name}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{c.sent.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{c.delivered.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{c.inboxRate}%</td>
                      <td className="px-3 py-2.5 text-ink-soft">{c.openRate}%</td>
                      <td className="px-3 py-2.5 text-ink-soft">{c.bounceRate}%</td>
                      <td className="px-3 py-2.5"><StatusPill tone={c.status === "Good" ? "green" : "amber"}>{c.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-4 text-[13px] font-bold text-ink">Deliverability Workflow</div>
            <div className="flex flex-wrap gap-2">
              {STEPS.map(([t, d], i) => (
                <div key={t} className="flex-1 min-w-[150px] rounded-xl border border-line bg-bg-soft/40 p-3">
                  <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-grad-brand text-[12px] font-bold text-white">{i + 1}</div>
                  <div className="text-[12.5px] font-semibold text-ink">{t}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">AI Recommendations</span></div>
            <div className="space-y-3">
              {RECS.map(([t, d, tag]) => (
                <div key={t} className="border-b border-line/60 pb-3 last:border-0">
                  <div className="text-[12.5px] font-semibold text-ink">{t}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{d}</div>
                  <StatusPill tone={tag.startsWith("High") ? "orange" : "amber"} className="mt-1">{tag}</StatusPill>
                </div>
              ))}
            </div>
          </div>
          <SideStat title="Suppression Health" value="2.4%" hint="Total Suppressed 24,618" />
          <SideStat title="Blocklist Alerts" value="0" hint="Active Listings · All clear" tone="green" />
          <SideStat title="Seed Test Results" value="85.7%" hint="Avg Inbox Placement · +6.2%" tone="green" />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-4 shadow-card"><div className="mb-2 text-[12.5px] font-bold text-ink">{title}</div>{children}</div>;
}
function SideStat({ title, value, hint, tone }: { title: string; value: string; hint: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="text-[12.5px] font-bold text-ink">{title}</div>
      <div className={`mt-1 text-[22px] font-extrabold ${tone === "green" ? "text-emerald-600" : "text-ink"}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted">{hint}</div>
    </div>
  );
}

function ChartCard({ title, series }: { title: string; series: [string, string, number[]][] }) {
  const max = Math.max(...series.flatMap(([, , d]) => d)) * 1.15;
  const days = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];
  const w = 320, h = 120, pad = 4;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (days.length - 1);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink">{title}</span>
        <div className="flex gap-2 text-[10px]">{series.map(([n, c]) => <span key={n} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{n}</span>)}</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {series.map(([n, c, d]) => (
          <polyline key={n} fill="none" stroke={c} strokeWidth="2" points={d.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-ink-muted">{days.map((d) => <span key={d}>{d}</span>)}</div>
    </div>
  );
}
