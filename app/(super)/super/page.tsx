import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert, TrendingUp, Users, Building2, DollarSign, Activity, Sparkles, Zap } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { SUPER_KPIS, SUPER_ORGS, REGIONS, CMD_ALERTS, CMD_SEV_TONE, REVENUE_TREND } from "@/lib/super-data";

export const metadata: Metadata = { title: "Super Admin — Amplivanta" };

const QUICK_ACTIONS = [
  { icon: Building2, label: "New organization" },
  { icon: Users, label: "Invite super admin" },
  { icon: DollarSign, label: "Apply credit" },
  { icon: ShieldAlert, label: "Impersonate tenant" },
  { icon: Sparkles, label: "Broadcast announcement" },
  { icon: Zap, label: "Trigger maintenance" },
];

export default function SuperDashboardPage() {
  const maxRev = Math.max(...REVENUE_TREND);
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-extrabold text-ink">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Global overview across all Amplivanta organizations.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {SUPER_KPIS.map((k, i) => {
          const tones = ["text-violet", "text-pink-brand", "text-blue-600", "text-emerald-600", "text-orange-brand", "text-amber-600", "text-indigo-600", "text-teal-600"];
          return (
            <div key={k.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="text-[11px] font-semibold text-ink-muted">{k.label}</div>
              <div className={`mt-1 text-[22px] font-extrabold ${tones[i]}`}>{k.value}</div>
              <div className="text-[11px] font-semibold text-emerald-600">↑ {k.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">MRR Trend · 12 months</div>
            <span className="text-[11px] text-ink-muted">Last month: $482K</span>
          </div>
          <svg viewBox="0 0 600 220" className="h-56 w-full">
            <defs><linearGradient id="mrr-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6D3BF5" stopOpacity="0.35" /><stop offset="1" stopColor="#6D3BF5" stopOpacity="0" /></linearGradient></defs>
            {[0, 100, 200, 300, 400, 500, 600].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#e9e7f0" strokeDasharray="2 4" />)}
            {REVENUE_TREND.map((v, i) => {
              const x = (i / (REVENUE_TREND.length - 1)) * 600;
              const y = 220 - (v / maxRev) * 180;
              const next = REVENUE_TREND[i + 1];
              if (!next) return null;
              const x2 = ((i + 1) / (REVENUE_TREND.length - 1)) * 600;
              const y2 = 220 - (next / maxRev) * 180;
              return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#6D3BF5" strokeWidth="2.5" />;
            })}
            <path d={"M0," + (220 - (REVENUE_TREND[0] / maxRev) * 180) + " " + REVENUE_TREND.map((v, i) => "L" + (i / (REVENUE_TREND.length - 1)) * 600 + "," + (220 - (v / maxRev) * 180)).join(" ") + " L600,220 L0,220 Z"} fill="url(#mrr-g)" />
          </svg>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[14px] font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Command Center — {CMD_ALERTS.filter((a) => a.status === "Open").length} open</div>
            <Link href="/super/command" className="text-[12px] font-bold text-red-700">Open all →</Link>
          </div>
          <div className="space-y-2">
            {CMD_ALERTS.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-xl border border-red-200 bg-white p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <StatusPill tone={CMD_SEV_TONE[a.severity]}>{a.severity}</StatusPill>
                  <span className="text-[10.5px] font-bold text-ink-muted">{a.category}</span>
                </div>
                <div className="text-[12.5px] font-semibold text-ink">{a.title}</div>
                <div className="text-[10.5px] text-ink-muted">{a.org} · {a.age}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Organizations</div>
            <button className="text-[12px] font-semibold text-violet">Directory →</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Org</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">MRR</th>
                <th className="pb-2 text-right">Users</th>
                <th className="pb-2">Region</th>
              </tr>
            </thead>
            <tbody>
              {SUPER_ORGS.slice(0, 6).map((o) => (
                <tr key={o.name} className="border-b border-line last:border-0">
                  <td className="py-2.5">
                    <div className="text-[12.5px] font-semibold text-ink">{o.name}</div>
                    <div className="text-[10.5px] text-ink-muted">{o.createdAt}</div>
                  </td>
                  <td className="py-2.5 text-[12px] text-ink-soft">{o.plan}</td>
                  <td className="py-2.5 text-right text-[12px] font-bold">${o.mrr.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-[12px]">{o.users}</td>
                  <td className="py-2.5"><StatusPill tone={o.region === "US" ? "blue" : o.region === "EU" ? "violet" : o.region === "APAC" ? "pink" : "gray"}>{o.region}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Users by Region</div>
            <span className="text-[11px] text-ink-muted">Click to drill down</span>
          </div>
          <div className="space-y-3">
            {REGIONS.map((r) => (
              <div key={r.region}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={r.region === "US" ? "blue" : r.region === "EU" ? "violet" : r.region === "APAC" ? "pink" : "gray"}>{r.region}</StatusPill>
                    <span className="text-ink-soft">{r.orgs} orgs · {r.users.toLocaleString()} users</span>
                  </div>
                  <span className="font-bold text-ink">${(r.mrr / 1000).toFixed(0)}K MRR</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${(r.users / 4820) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Quick Actions</div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <button key={a.label} className="flex flex-col items-start gap-2 rounded-xl border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><a.icon className="h-4 w-4" /></div>
              <span className="text-[12.5px] font-semibold text-ink">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/30 p-4 text-[12px]">
        <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-600" /><span className="font-bold text-red-700">Impersonation</span></div>
        <div className="mt-1 text-ink-soft">Every cross-tenant action requires explicit authorization and is audit-logged with your Super Admin identity. Impersonation sessions display a persistent banner in the tenant workspace.</div>
      </div>
    </div>
  );
}
