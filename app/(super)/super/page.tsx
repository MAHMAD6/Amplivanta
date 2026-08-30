import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users, DollarSign, ShieldCheck, Gift, TrendingUp, ShieldAlert, Eye, Info, CreditCard, Bell, FileWarning, Gauge, AlertTriangle, ShieldX, Globe, Sparkles, Server, Download } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Super Admin Command Center — Amplivanta" };
export const dynamic = "force-dynamic";

async function platformOverview() {
  try {
    const [orgs, users, subs, activeSubs] = await Promise.all([
      db.workspace.count().catch(() => 0),
      db.user.count().catch(() => 0),
      db.subscription.findMany({ include: { plan: true } }).catch(() => [] as { status: string; plan: { price: number } | null }[]),
      db.subscription.count({ where: { status: "active" } }).catch(() => 0),
    ]);
    const mrr = subs.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);
    return { orgs, users, activeSubs, mrr, freeAccounts: Math.max(0, orgs - subs.length), hasData: orgs > 0 };
  } catch {
    return { orgs: 0, users: 0, activeSubs: 0, mrr: 0, freeAccounts: 0, hasData: false };
  }
}

const ALERTS = [
  { icon: CreditCard, title: "Failed Payments" },
  { icon: Bell, title: "Subscription Issues" },
  { icon: FileWarning, title: "Invoice Overdue" },
  { icon: Gauge, title: "Usage Limit Reached" },
  { icon: AlertTriangle, title: "Integration Errors" },
  { icon: Globe, title: "Domain Issues" },
  { icon: ShieldX, title: "Security Alerts" },
];
const QUICK = ["Create Organization", "Add User", "Grant Credit / Free Months", "Impersonate User", "Send Announcement", "Run System Backup", "View Audit Logs", "Export Reports"];
const HEALTH = ["API", "Database", "Workers", "Storage", "Email Service", "AI Service"];
const INFRA = [["Users by Region", Globe], ["AI Usage (This Month)", Sparkles], ["Storage Usage", Server], ["Email Deliverability", Bell], ["Integrations Health", Gauge], ["Domain Health", Globe]] as const;

export default async function SuperCommandCenterPage() {
  const p = await platformOverview();
  const n = (v: number, prefix = "") => (p.hasData && v > 0 ? `${prefix}${v.toLocaleString()}` : "No data yet");

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Impersonation banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[12.5px]"><Eye className="h-4 w-4 text-amber-600" /><span className="font-bold text-amber-700">IMPERSONATION MODE</span><span className="text-ink-soft">You are not impersonating anyone</span></div>
        <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink">Start Impersonation</button>
      </div>
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-line bg-royal-tint/40 px-4 py-2 text-[12px] text-ink-soft"><Info className="h-4 w-4 text-royal-blue" /> All actions are being logged and audited.</div>

      <div className="mb-1 flex items-end justify-between">
        <div><h1 className="font-display text-[24px] font-extrabold text-ink">Overview</h1><p className="text-[13px] text-ink-soft">Real-time overview of the Amplivanta platform</p></div>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-ink"><Download className="h-3.5 w-3.5" /> Customize Dashboard</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          {/* KPI row */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Kpi icon={Building2} tone="violet" label="Organizations" value={n(p.orgs)} />
            <Kpi icon={Users} tone="blue" label="Total Users" value={n(p.users)} />
            <Kpi icon={DollarSign} tone="green" label="Monthly Recurring Revenue" value={p.hasData && p.mrr > 0 ? `$${p.mrr.toLocaleString()}` : "No data yet"} />
            <Kpi icon={ShieldCheck} tone="indigo" label="Active Subscriptions" value={n(p.activeSubs)} />
            <Kpi icon={Gift} tone="amber" label="Free Plan Accounts" value={n(p.freeAccounts)} sub="Free Forever" />
            <Kpi icon={TrendingUp} tone="teal" label="Upgrade Opportunities" value="No data yet" />
            <Kpi icon={ShieldAlert} tone="green" label="Platform Risk Level" value="Normal" sub="All systems operational" />
          </div>

          {/* Charts row — truthful empty */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <EmptyCard title="Revenue Overview" note="Revenue data will appear here" cta="View Full Report" />
            <EmptyCard title="Subscriptions by Plan" note="No data yet" cta="View All Plans" donut />
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="mb-3 text-[13px] font-bold text-ink">Plan Changes</div>
              {["Upgrades", "Downgrades", "Cancellations", "Reactivations"].map((r) => (
                <div key={r} className="flex items-center justify-between border-b border-line/60 py-2 text-[12.5px] last:border-0"><span className="text-ink-soft">{r}</span><span className="text-ink-muted">No data yet</span></div>
              ))}
              <Link href="/super/analytics" className="mt-2 block text-center text-[12px] font-semibold text-royal-blue">View Full Report</Link>
            </div>
          </div>

          {/* Infra row */}
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {INFRA.map(([label, Icon]) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-4 text-center shadow-card">
                <div className="text-[12px] font-bold text-ink">{label}</div>
                <Icon className="mx-auto my-3 h-7 w-7 text-ink-muted/50" />
                <div className="text-[11px] text-ink-muted">No data yet</div>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-1"><div className="mb-2 text-[13px] font-bold text-ink">Recent Admin Activity</div><p className="py-6 text-center text-[11.5px] text-ink-muted">Admin actions will appear here</p></div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card"><div className="mb-2 text-[13px] font-bold text-ink">System Health</div>{HEALTH.map((h) => <div key={h} className="flex items-center justify-between py-1 text-[12px]"><span className="flex items-center gap-1.5 text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-ink-muted/40" /> {h}</span><span className="text-ink-muted">No data yet</span></div>)}</div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card"><div className="mb-2 text-[13px] font-bold text-ink">Support Overview</div>{["Open Tickets", "Unassigned", "Avg. Response Time"].map((r) => <div key={r} className="flex items-center justify-between py-1.5 text-[12px]"><span className="text-ink-soft">{r}</span><span className="text-ink-muted">No data yet</span></div>)}</div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card"><div className="mb-2 text-[13px] font-bold text-ink">Announcements</div><p className="py-6 text-center text-[11.5px] text-ink-muted">No announcements yet</p></div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Command Center</span><Link href="/super/command" className="text-[11px] font-semibold text-royal-blue">View All</Link></div>
            <div className="space-y-1.5">
              {ALERTS.map((a) => (
                <div key={a.title} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-soft text-ink-muted"><a.icon className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><div className="text-[12px] font-semibold text-ink">{a.title}</div><div className="text-[10px] text-ink-muted">No items</div></div></div>
              ))}
            </div>
            <button className="mt-2 w-full rounded-lg border border-line py-2 text-[12px] font-semibold text-royal-blue">Acknowledge All</button>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Quick Actions</div>
            <div className="space-y-0.5">
              {QUICK.map((q) => <button key={q} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-ink-soft hover:bg-bg-soft"><Sparkles className="h-3.5 w-3.5 text-royal-blue" /> {q}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TONE: Record<string, string> = { violet: "bg-violet/10 text-violet", blue: "bg-blue-500/10 text-blue-600", green: "bg-emerald-500/10 text-emerald-600", indigo: "bg-indigo-500/10 text-indigo-600", amber: "bg-amber-500/10 text-amber-600", teal: "bg-teal-500/10 text-teal-600" };
function Kpi({ icon: Icon, tone, label, value, sub }: { icon: typeof Building2; tone: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE[tone]}`}><Icon className="h-4 w-4" /></span></div>
      <div className="text-[11px] font-medium text-ink-muted">{label}</div>
      <div className={`mt-0.5 font-extrabold ${value === "No data yet" ? "text-[13px] text-ink-soft" : "text-[20px] text-ink"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-ink-muted">{sub}</div>}
    </div>
  );
}
function EmptyCard({ title, note, cta, donut }: { title: string; note: string; cta: string; donut?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">{title}</span></div>
      <div className="flex h-32 items-center justify-center">
        {donut ? <div className="relative h-24 w-24 rounded-full border-8 border-bg-soft"><div className="absolute inset-0 flex items-center justify-center text-[10px] text-ink-muted">No data<br />yet</div></div> : <div className="text-center text-[11.5px] text-ink-muted">{note}</div>}
      </div>
      <button className="w-full rounded-lg border border-line py-2 text-[12px] font-semibold text-royal-blue">{cta}</button>
    </div>
  );
}
