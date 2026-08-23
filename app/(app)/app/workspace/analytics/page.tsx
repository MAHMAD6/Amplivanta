import type { Metadata } from "next";
import { Download, Eye, Users, DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";

export const metadata: Metadata = { title: "Workspace Analytics — Amplivanta" };

export default function WSAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Campaign Analytics"
        subtitle="Analytics inside the active workspace — cross-channel, one date range."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days · vs prev</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export Report</button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Eye} label="Sessions" value="42.8K" delta="12%" tone="violet" />
        <KpiCard icon={Users} label="Leads" value="2,543" delta="18%" tone="blue" />
        <KpiCard icon={TrendingUp} label="Conversions" value="842" delta="24%" tone="green" />
        <KpiCard icon={TrendingUp} label="Conv. Rate" value="4.2%" delta="0.6 pts" tone="pink" />
        <KpiCard icon={DollarSign} label="Revenue" value="$342K" delta="22%" tone="orange" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">Sessions Trend</div>
          <svg viewBox="0 0 600 220" className="h-56 w-full">
            <defs>
              <linearGradient id="ws-a" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#6D3BF5" stopOpacity="0.35" />
                <stop offset="1" stopColor="#6D3BF5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 100, 200, 300, 400, 500, 600].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#e9e7f0" strokeDasharray="2 4" />)}
            <path d="M0,180 C60,140 120,150 180,120 C240,90 300,110 360,80 C420,50 480,70 540,40 L600,30 L600,220 L0,220 Z" fill="url(#ws-a)" />
            <path d="M0,180 C60,140 120,150 180,120 C240,90 300,110 360,80 C420,50 480,70 540,40 L600,30" fill="none" stroke="#6D3BF5" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Channel Mix</div>
          <div className="space-y-3">
            {[
              { c: "Organic Search", pct: 38, tone: "bg-violet" },
              { c: "Paid Ads", pct: 26, tone: "bg-pink-brand" },
              { c: "Email", pct: 18, tone: "bg-blue-500" },
              { c: "Social", pct: 12, tone: "bg-emerald-500" },
              { c: "Direct", pct: 6, tone: "bg-amber-500" },
            ].map((r) => (
              <div key={r.c}>
                <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-ink-soft">{r.c}</span><span className="font-bold text-ink">{r.pct}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className={`h-full rounded-full ${r.tone}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Attribution Model</div>
          <div className="mb-3 flex flex-wrap gap-1">
            {["Last touch", "First touch", "Linear", "Time decay", "Position-based"].map((m, i) => (
              <button key={m} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${i === 3 ? "bg-violet/10 text-violet" : "text-ink-soft"}`}>{m}</button>
            ))}
          </div>
          <div className="space-y-2 text-[12px]">
            {[
              { c: "Organic Search", r: 128000, share: 37 },
              { c: "Paid Ads", r: 88400, share: 26 },
              { c: "Email", r: 62400, share: 18 },
              { c: "Social", r: 42000, share: 12 },
              { c: "Direct", r: 21200, share: 7 },
            ].map((r) => (
              <div key={r.c} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
                <span className="text-ink">{r.c}</span>
                <span><span className="font-bold text-ink">${r.r.toLocaleString()}</span> <span className="ml-1 text-[10.5px] text-ink-muted">({r.share}%)</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
          <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> AI Insights</div>
          <div className="space-y-2 text-[12.5px]">
            <div className="rounded-xl border border-line bg-white p-3">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600">Insight</span>
              <div className="mt-1.5 font-semibold text-ink">Organic + Email drive 55% of revenue</div>
              <div className="text-[11.5px] text-ink-muted">Compounding channels — invest more in SEO content.</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-3">
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">Anomaly</span>
              <div className="mt-1.5 font-semibold text-ink">Paid CPL up 22% week-over-week</div>
              <div className="text-[11.5px] text-ink-muted">LinkedIn creative fatigue — refresh 3 top ads.</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-3">
              <span className="rounded-full bg-violet/10 px-2 py-0.5 text-[10.5px] font-bold text-violet">Opportunity</span>
              <div className="mt-1.5 font-semibold text-ink">Direct traffic converts at 8.4%</div>
              <div className="text-[11.5px] text-ink-muted">Brand demand strong — retarget with dedicated LP.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
