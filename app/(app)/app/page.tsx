import type { Metadata } from "next";
import { ChartPlaceholder } from "@/components/amplivanta/chart-placeholder";
import Link from "next/link";
import { Building2, BarChart3, Crosshair, Clock, GitBranch, Database, Target, TrendingUp, Megaphone, Sparkles, Bell, Users2, ArrowRight, ChevronRight, Info } from "lucide-react";
import { loadCommandCenter } from "@/lib/server/command-center";
import { LiveBadge } from "@/components/amplivanta/live-badge";

export const metadata: Metadata = { title: "Growth Command Center — Amplivanta" };
export const dynamic = "force-dynamic";

const STEPS = [
  { n: 1, title: "Diagnose", desc: "Understand your growth health", icon: Building2 },
  { n: 2, title: "Recommend", desc: "AI identifies your best opportunities", icon: BarChart3 },
  { n: 3, title: "Execute", desc: "Move from insight to action with built-in automation", icon: Crosshair },
  { n: 4, title: "Measure", desc: "Track performance and impact", icon: Clock },
  { n: 5, title: "Optimize", desc: "Continuously improve for better results", icon: GitBranch },
];

export default async function CommandCenterPage() {
  const cc = await loadCommandCenter();
  const attentionCount = cc.attention.length;

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-ink">Growth Command Center</h1>
          <p className="mt-1 text-sm text-ink-soft">Your command center to drive measurable growth.</p>
        </div>
      </div>

      {/* Diagnose → Optimize flow */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-[150px] items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><s.icon className="h-5 w-5" /></span>
                <div><div className="text-[12.5px] font-bold text-ink">{s.n} {s.title}</div><div className="text-[10.5px] leading-snug text-ink-muted">{s.desc}</div></div>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="hidden h-4 w-4 shrink-0 text-ink-muted lg:block" />}
            </div>
          ))}
        </div>
      </div>

      {cc.live && <LiveBadge label="Live · reflecting your real workspace state" />}

      {/* KPI cards — truthful empty states */}
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <KpiEmpty icon={Target} title="Growth Score" heading="No score yet" body="Connect your data to get your Growth Score and insights." cta="Connect Data" href="/app/integrations" ring />
        <KpiEmpty icon={Crosshair} title="Top Opportunity" heading="Connect your data" body="We'll analyze your performance to identify your highest-priority opportunity." />
        <KpiEmpty icon={TrendingUp} title="Potential Impact" heading="—" body="Impact will be shown here once we analyze your data." />
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Active Campaigns</span><Megaphone className="h-4 w-4 text-violet" /></div>
          {cc.activeCampaigns > 0 ? (
            <div className="text-[26px] font-extrabold text-ink">{cc.activeCampaigns}</div>
          ) : (
            <><div className="text-[20px] font-extrabold text-ink-soft">—</div><p className="mt-1 text-[11.5px] leading-snug text-ink-muted">Your active campaigns will appear here.</p></>
          )}
          <Link href="/app/marketing/campaigns" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-royal-blue">Go to Campaigns <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* AI Recommended Next Action */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet" /><div><div className="text-[15px] font-bold text-ink">AI Recommended Next Action</div><div className="text-[11.5px] text-ink-muted">AI insight based on your data and goals</div></div></div>
          <div className="flex flex-col items-center py-8 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet/10 text-violet"><Sparkles className="h-7 w-7" /></span>
            <div className="text-[15px] font-bold text-ink">Connect your data to get AI recommendations</div>
            <p className="mt-1 max-w-md text-[12.5px] text-ink-soft">Once we have enough data, Amplivanta AI will recommend the next best action to drive the most impact for your business.</p>
            <Link href="/app/integrations" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft"><Database className="h-4 w-4" /> Connect Data</Link>
            <Link href="/app/growth-audit" className="mt-2 text-[12px] font-semibold text-royal-blue">Learn how it works →</Link>
          </div>
        </div>

        {/* Needs Your Attention */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-ink"><Bell className="h-4 w-4" /> Needs Your Attention</div>
            {attentionCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{attentionCount}</span>}
          </div>
          {attentionCount === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-ink-muted">You&apos;re all caught up.</p>
          ) : (
            <div className="space-y-2">
              {cc.attention.map((a) => (
                <Link key={a.key} href={a.href} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-royal-blue/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-royal-tint text-royal-blue"><Info className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-bold text-ink">{a.title}</div><p className="text-[11.5px] text-ink-soft">{a.detail}</p></div>
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/app/notifications" className="mt-3 block text-center text-[12px] font-semibold text-royal-blue">View all alerts →</Link>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Performance Overview */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-1 flex items-center justify-between"><span className="text-[14px] font-bold text-ink">Performance Overview</span><span className="rounded-lg border border-line px-2 py-0.5 text-[11px] text-ink-soft">Last 7 days</span></div>
          <p className="text-[11.5px] text-ink-soft">Connect your data to see performance trends across your key metrics.</p>
          <div className="my-4 flex h-28 items-end gap-1 opacity-40">
            <ChartPlaceholder />
          </div>
          <div className="flex items-center justify-between"><span className="text-[11.5px] text-ink-muted">No data connected</span><Link href="/app/integrations" className="rounded-lg border border-line px-3 py-1 text-[12px] font-semibold text-royal-blue">Connect Data</Link></div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between"><span className="text-[14px] font-bold text-ink">Recent Activity</span><Link href="/app/workspace/activity" className="text-[12px] font-semibold text-royal-blue">View all</Link></div>
          {cc.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {cc.recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-violet/10 text-violet"><Sparkles className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium text-ink">{a.title}</div><div className="text-[10.5px] text-ink-muted">{new Date(a.when).toLocaleDateString()}</div></div></div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {[["Connect your first data source", "Get real-time insights"], ["Create your first campaign", "Start reaching your audience"], ["Set up your team", "Invite members and set roles"], ["Explore AI Advisor", "Get personalized growth advice"]].map(([t, d]) => (
                <li key={t} className="flex items-start justify-between gap-2 text-[12.5px]"><div><div className="font-semibold text-ink">{t}</div><div className="text-[10.5px] text-ink-muted">{d}</div></div><span className="text-ink-muted">—</span></li>
              ))}
            </ul>
          )}
        </div>

        {/* Get Started */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between"><span className="text-[14px] font-bold text-ink">Get Started</span><span className="text-[13px] font-bold text-violet">{cc.completion}%</span></div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand transition-all" style={{ width: `${cc.completion}%` }} /></div>
          <ul className="space-y-2.5">
            {cc.getStarted.map((g) => (
              <li key={g.key} className="flex items-center gap-2.5 text-[12.5px]">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${g.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink/30"}`}>{g.done && "✓"}</span>
                <span className={g.done ? "text-ink-muted line-through" : "text-ink"}>{g.label}</span>
              </li>
            ))}
          </ul>
          <Link href="/app/onboarding" className="mt-4 block text-center text-[12px] font-semibold text-royal-blue">View onboarding guide →</Link>
        </div>
      </div>
    </div>
  );
}

function KpiEmpty({ icon: Icon, title, heading, body, cta, href, ring }: { icon: typeof Target; title: string; heading: string; body: string; cta?: string; href?: string; ring?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">{title}</span><Icon className="h-4 w-4 text-violet" /></div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[18px] font-extrabold text-ink-soft">{heading}</div>
          <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">{body}</p>
          {cta && href && <Link href={href} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-royal-blue/40 px-3 py-1.5 text-[11.5px] font-semibold text-royal-blue"><Database className="h-3.5 w-3.5" /> {cta}</Link>}
        </div>
        {ring && <svg viewBox="0 0 40 40" className="h-12 w-12 shrink-0"><circle cx="20" cy="20" r="15" stroke="#e9e7f0" strokeWidth="5" fill="none" /></svg>}
      </div>
    </div>
  );
}
