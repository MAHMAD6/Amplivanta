import type { Metadata } from "next";
import Link from "next/link";
import { Users, DollarSign, Target, Workflow as WFI, Mail, TrendingUp, Plus, Sparkles, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { loadCampaigns, loadWorkflows } from "@/lib/server/loaders";
import { CAMPAIGN_STATUS_TONE } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Marketing Automation — Amplivanta" };

export default async function MarketingDashboardPage() {
  const [{ items: CAMPAIGNS }, { items: WORKFLOWS }] = await Promise.all([
    loadCampaigns(),
    loadWorkflows(),
  ]);

  const active = CAMPAIGNS.filter((c) => c.status === "Active").slice(0, 4);
  const activeWfs = WORKFLOWS.filter((w) => w.status === "Active").slice(0, 4);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Marketing Automation"
        subtitle="Command center for campaigns, workflows, lead capture and marketing performance."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Plus className="h-3.5 w-3.5" /> New Campaign
            </button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <KpiCard icon={Target} label="Active Campaigns" value="4" delta="2 this week" tone="violet" />
        <KpiCard icon={WFI} label="Active Workflows" value="34" delta="4 launched" tone="pink" />
        <KpiCard icon={Users} label="New Leads (30d)" value="2,543" delta="18.6%" tone="blue" />
        <KpiCard icon={Mail} label="Emails Sent" value="128K" delta="24%" tone="orange" />
        <KpiCard icon={TrendingUp} label="Conversion Rate" value="4.2%" delta="0.6 pts" tone="green" />
        <KpiCard icon={DollarSign} label="Revenue Influenced" value="$342K" delta="22%" tone="teal" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Lead Conversion Funnel</div>
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "Visitors", value: "42,800", pct: 100, tone: "bg-violet/70" },
            { label: "Leads", value: "8,420", pct: 20, tone: "bg-violet" },
            { label: "MQLs", value: "3,480", pct: 8, tone: "bg-pink-brand" },
            { label: "SQLs", value: "842", pct: 2, tone: "bg-orange-brand" },
            { label: "Customers", value: "128", pct: 0.3, tone: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-bg-soft/40 p-3">
              <div className="text-[11px] font-semibold text-ink-muted">{s.label}</div>
              <div className="mt-1 text-[22px] font-extrabold text-ink">{s.value}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className={`h-full rounded-full ${s.tone}`} style={{ width: `${Math.max(s.pct, 6)}%` }} />
              </div>
              <div className="mt-1 text-[10.5px] text-ink-muted">{s.pct}% of top</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Active Campaigns</div>
            <Link href="/app/marketing/campaigns" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="space-y-3">
            {active.map((c) => (
              <div key={c.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                    <div className="text-[11px] text-ink-muted">{c.type} · {c.channel.join(" · ")}</div>
                  </div>
                  <StatusPill tone={CAMPAIGN_STATUS_TONE[c.status]}>{c.status}</StatusPill>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-ink-muted">Reach: </span><span className="font-bold text-ink">{(c.reach / 1000).toFixed(1)}K</span></div>
                  <div><span className="text-ink-muted">CTR: </span><span className="font-bold text-ink">{c.ctr}%</span></div>
                  <div><span className="text-ink-muted">Revenue: </span><span className="font-bold text-emerald-600">${(c.revenue / 1000).toFixed(0)}K</span></div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Top Workflows</div>
            <Link href="/app/marketing/workflows" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Workflow</th>
                <th className="pb-2 text-right">Enrolled</th>
                <th className="pb-2 text-right">CVR</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {activeWfs.map((w) => (
                <tr key={w.id} className="border-b border-line last:border-0">
                  <td className="py-2.5">
                    <div className="text-[12.5px] font-semibold text-ink">{w.name}</div>
                    <div className="text-[10.5px] text-ink-muted">Trigger: {w.trigger}</div>
                  </td>
                  <td className="py-2.5 text-right text-[12px]">{w.enrolled.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-[12px] font-bold text-emerald-600">{w.conversionRate}%</td>
                  <td className="py-2.5 text-right text-[12px] font-bold text-ink">${(w.revenue / 1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50/40 p-5 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-bold text-amber-700">
            <AlertTriangle className="h-4 w-4" /> 2 issues need attention
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-3 text-[12px]">
              <div>
                <div className="font-semibold text-ink">Welcome Series — 3 executions failed</div>
                <div className="text-ink-muted">SMTP bounces on invalid recipients. Cleanup segment.</div>
              </div>
              <Link href="/app/marketing/execution-logs" className="text-[11px] font-bold text-violet">Investigate →</Link>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-3 text-[12px]">
              <div>
                <div className="font-semibold text-ink">beta.amplivanta.com — SSL expired</div>
                <div className="text-ink-muted">Renew certificate to avoid landing page downtime.</div>
              </div>
              <Link href="/app/marketing/domains" className="text-[11px] font-bold text-violet">Renew →</Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
          <div className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-ink">
            <Sparkles className="h-4 w-4 text-violet" /> AI Recommendations
          </div>
          <div className="space-y-2">
            {[
              "Winback flow open rate is 12% — try AI-generated subjects.",
              "PQL Ready segment grew 42% — increase Sales alerts.",
              "3 emails scheduled outside optimal send window (Tue 10 AM).",
            ].map((r, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-2.5 text-[11.5px] text-ink-soft">
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
