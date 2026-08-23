import type { Metadata } from "next";
import { Download, Filter } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { PLATFORM_ANALYTICS_KPIS, REVENUE_TREND, PLAN_MIX, REGIONS, MODULE_ADOPTION, AI_COST } from "@/lib/super-data";

export const metadata: Metadata = { title: "Super Admin Analytics — Amplivanta" };

export default function SuperAnalyticsPage() {
  const totalMRR = PLAN_MIX.reduce((s, p) => s + p.mrr, 0);
  const maxRev = Math.max(...REVENUE_TREND);
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-ink">Platform Analytics</h1>
          <p className="mt-1 text-sm text-ink-soft">Growth, revenue, plan mix, region, module adoption, AI cost, operational trends.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 12 months</button>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" />Filters</button>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" />Export</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        {PLATFORM_ANALYTICS_KPIS.map((k, i) => {
          const tones = ["text-violet", "text-pink-brand", "text-emerald-600", "text-blue-600", "text-orange-brand", "text-indigo-600"];
          return (
            <div key={k.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="text-[10.5px] font-semibold text-ink-muted">{k.label}</div>
              <div className={`mt-1 text-[20px] font-extrabold ${tones[i]}`}>{k.value}</div>
              <div className="text-[10.5px] font-semibold text-emerald-600">↑ {k.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Revenue Growth</div>
          <span className="text-[11px] text-ink-muted">Monthly · last 12 months</span>
        </div>
        <svg viewBox="0 0 600 220" className="h-56 w-full">
          <defs><linearGradient id="rev-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6D3BF5" stopOpacity="0.4" /><stop offset="1" stopColor="#6D3BF5" stopOpacity="0" /></linearGradient></defs>
          {[0, 100, 200, 300, 400, 500, 600].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#e9e7f0" strokeDasharray="2 4" />)}
          <path d={"M0," + (220 - (REVENUE_TREND[0] / maxRev) * 180) + " " + REVENUE_TREND.map((v, i) => "L" + (i / (REVENUE_TREND.length - 1)) * 600 + "," + (220 - (v / maxRev) * 180)).join(" ") + " L600,220 L0,220 Z"} fill="url(#rev-g)" />
          {REVENUE_TREND.map((v, i) => {
            const x = (i / (REVENUE_TREND.length - 1)) * 600;
            const y = 220 - (v / maxRev) * 180;
            const next = REVENUE_TREND[i + 1];
            if (!next) return null;
            const x2 = ((i + 1) / (REVENUE_TREND.length - 1)) * 600;
            const y2 = 220 - (next / maxRev) * 180;
            return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#6D3BF5" strokeWidth="2.5" />;
          })}
        </svg>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Plan Mix</div>
          <div className="mb-4 flex h-8 overflow-hidden rounded-full border border-line">
            {PLAN_MIX.map((p, i) => {
              const colors = ["bg-emerald-500", "bg-violet", "bg-pink-brand", "bg-orange-brand"];
              return <div key={p.plan} className={`${colors[i]} flex items-center justify-center text-[10px] font-bold text-white`} style={{ width: `${p.share}%` }}>{p.share >= 8 && `${p.share}%`}</div>;
            })}
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">Orgs</th>
                <th className="pb-2 text-right">MRR</th>
                <th className="pb-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_MIX.map((p) => (
                <tr key={p.plan} className="border-b border-line last:border-0">
                  <td className="py-2 text-[13px] font-semibold text-ink">{p.plan}</td>
                  <td className="py-2 text-right text-[12px]">{p.orgs}</td>
                  <td className="py-2 text-right text-[12px] font-bold">${p.mrr.toLocaleString()}</td>
                  <td className="py-2 text-right text-[12px]">{p.share}%</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 text-[13px] text-ink">Total</td>
                <td className="py-2 text-right text-[12.5px]">{PLAN_MIX.reduce((s, p) => s + p.orgs, 0).toLocaleString()}</td>
                <td className="py-2 text-right text-[12.5px]">${totalMRR.toLocaleString()}</td>
                <td className="py-2 text-right text-[12.5px]">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Regional MRR</div>
          <div className="space-y-3">
            {REGIONS.map((r) => (
              <div key={r.region}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={r.region === "US" ? "blue" : r.region === "EU" ? "violet" : r.region === "APAC" ? "pink" : "gray"}>{r.region}</StatusPill>
                    <span className="text-ink-soft">{r.orgs} orgs · {r.users.toLocaleString()} users</span>
                  </div>
                  <span className="font-bold text-ink">${(r.mrr / 1000).toFixed(0)}K</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-orange-brand" style={{ width: `${(r.mrr / 268000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Module Adoption</div>
          <div className="space-y-2">
            {MODULE_ADOPTION.map((m) => (
              <div key={m.module}>
                <div className="mb-1 flex items-center justify-between text-[11.5px]">
                  <span className="text-ink-soft">{m.module}</span>
                  <span className="font-bold text-ink">{m.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${m.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">AI Usage & Cost (30d)</div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Model</th>
                <th className="pb-2 text-right">Requests</th>
                <th className="pb-2 text-right">Cost</th>
                <th className="pb-2 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {AI_COST.map((a) => (
                <tr key={a.model} className="border-b border-line last:border-0">
                  <td className="py-2 text-[12.5px] font-semibold text-ink">{a.model}</td>
                  <td className="py-2 text-right text-[12px]">{a.requests}</td>
                  <td className="py-2 text-right text-[12px] font-bold">${a.cost.toLocaleString()}</td>
                  <td className={`py-2 text-right text-[11px] font-bold ${a.delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>{a.delta >= 0 ? "↑" : "↓"} {Math.abs(a.delta)}%</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 text-[13px] text-ink">Total</td>
                <td className="py-2"></td>
                <td className="py-2 text-right text-[12.5px]">${AI_COST.reduce((s, a) => s + a.cost, 0).toLocaleString()}</td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendCard title="Email Volume" primary="128M sent" note="Deliverability 98.6%" />
        <TrendCard title="Storage" primary="4.2 TB / 12 TB pool" note="Growth 12% MoM" />
        <TrendCard title="Support Tickets" primary="42 open · 12 P0/P1" note="Median resolution 4h 18m" />
      </div>
    </div>
  );
}

function TrendCard({ title, primary, note }: { title: string; primary: string; note: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{title}</div>
      <div className="mt-1 text-[18px] font-extrabold text-ink">{primary}</div>
      <div className="text-[11.5px] text-ink-soft">{note}</div>
    </div>
  );
}
