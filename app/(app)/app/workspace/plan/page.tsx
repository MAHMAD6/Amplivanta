import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, DollarSign, Target, Users, Calendar, TrendingUp, FileText, Edit, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { WS_CAMPAIGNS, WS_KPI_TARGETS, WS_STRATEGY } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Campaign Plan" };

export default function CampaignPlanPage() {
  const c = WS_CAMPAIGNS[0];
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Campaign Plan"
        subtitle="Turn AI recommendations into an executable strategy."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Edit className="h-3.5 w-3.5" /> Edit Plan</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> AI Next Actions</button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-line bg-white p-3 shadow-card">
        <div className="text-[12px] font-semibold text-ink-muted">Active Campaign:</div>
        <select className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink">
          {WS_CAMPAIGNS.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <StatusPill tone="green" className="ml-2">Live · 84%</StatusPill>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Plan detail */}
        <div className="space-y-4">
          {/* Overview cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Target} label="Goal" value={c.goal} tone="violet" />
            <MetricCard icon={Users} label="Audience" value={c.audience} tone="blue" />
            <MetricCard icon={DollarSign} label="Budget" value={`$${(c.budget / 1000).toFixed(0)}K`} tone="green" />
            <MetricCard icon={TrendingUp} label="Projected ROI" value={c.projectedROI} tone="pink" />
          </div>

          {/* Strategy */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-[14px] font-bold text-ink"><FileText className="h-4 w-4 text-violet" /> Strategy</div>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{WS_STRATEGY.strategy}</p>
          </div>

          {/* Funnel */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[14px] font-bold text-ink">Execution Funnel</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {WS_STRATEGY.funnel.map((f, i) => (
                <div key={f.stage} className="rounded-xl border border-line p-4">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-violet">Step {i + 1}</div>
                  <div className="mt-1 text-[13px] font-bold text-ink">{f.stage}</div>
                  <div className="mt-2 text-[11.5px] text-ink-muted">Channel</div>
                  <div className="text-[12px] font-semibold text-ink">{f.channel}</div>
                  <div className="mt-2 text-[11.5px] text-ink-muted">Tactic</div>
                  <div className="text-[11.5px] text-ink-soft">{f.tactic}</div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI targets */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[14px] font-bold text-ink">KPI Targets</div>
            <div className="space-y-3">
              {WS_KPI_TARGETS.map((k) => {
                const pct = Math.min(100, Math.round((k.current / k.target) * 100));
                return (
                  <div key={k.label}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-ink">{k.label}</span>
                      <span className="text-ink-soft">
                        <span className="font-bold text-ink">{k.unit === "$" ? "$" : ""}{k.current}{k.unit && k.unit !== "$" ? k.unit : ""}</span> / target {k.unit === "$" ? "$" : ""}{k.target}{k.unit && k.unit !== "$" ? k.unit : ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
                      <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[14px] font-bold text-ink"><Calendar className="h-4 w-4 text-violet" /> Timeline</div>
            <div className="text-[12.5px] text-ink">{c.timeline}</div>
            <div className="mt-3 grid grid-cols-4 gap-1 text-[10.5px] text-ink-muted">
              {["May", "Jun", "Jul", "Aug"].map((m) => (
                <div key={m} className="rounded-md bg-bg-soft/60 py-2 text-center font-semibold">{m}</div>
              ))}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft">
              <div className="h-full rounded-full bg-grad-brand" style={{ width: "84%" }} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Top Priorities</div>
            <ol className="space-y-2 text-[12.5px]">
              {WS_STRATEGY.topPriorities.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet/10 text-[10px] font-bold text-violet">{i + 1}</span>
                  <span className="text-ink">{p}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Related Documents</div>
            <div className="space-y-1.5 text-[12px]">
              {["Growth Brief v2.pdf", "Persona — SaaS Founder.pdf", "Channel Plan Q3.xlsx", "Board Deck Q3.pptx"].map((d) => (
                <Link key={d} href="#" className="flex items-center justify-between rounded-lg border border-line p-2 hover:border-violet/30">
                  <span className="truncate">{d}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink"><Sparkles className="h-3.5 w-3.5 text-violet" /> AI Next Actions</div>
            <ul className="space-y-1.5 text-[11.5px] text-ink-soft">
              <li>· Add third case study to nurture (est. +8% CR).</li>
              <li>· Convert audit CTA to gated form (est. +240 leads).</li>
              <li>· Test 60s explainer as YouTube ad.</li>
            </ul>
            <button className="mt-3 w-full rounded-xl bg-grad-cta py-2 text-[12px] font-bold text-white shadow-violet">Apply all</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "violet" | "green" | "blue" | "pink" }) {
  const toneCls = { violet: "bg-violet/10 text-violet", green: "bg-emerald-500/10 text-emerald-600", blue: "bg-blue-500/10 text-blue-600", pink: "bg-pink-brand/10 text-pink-brand" }[tone];
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${toneCls}`}><Icon className="h-4 w-4" /></div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 text-[13.5px] font-bold text-ink">{value}</div>
    </div>
  );
}
