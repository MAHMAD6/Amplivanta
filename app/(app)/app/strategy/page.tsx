import type { Metadata } from "next";
import Link from "next/link";
import { Target, DollarSign, TrendingUp, HeartHandshake, Sparkles, Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StrategySubnav } from "@/components/amplivanta/strategy-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { GOALS, CHANNELS, PERSONAS, SWOT, GOAL_STATUS_TONE, CHANNEL_TONE } from "@/lib/strategy-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { STRATEGY_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Marketing Strategy" };

export default function StrategyDashboardPage() {
  const totalBudget = CHANNELS.reduce((s, c) => s + c.plannedBudget, 0);
  const totalSpend = CHANNELS.reduce((s, c) => s + c.actualSpend, 0);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Marketing Strategy"
        subtitle="Growth objectives, initiatives, channels, AI-driven recommendations."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">Share Plan</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Sparkles className="h-3.5 w-3.5" /> AI Strategy</button>
            <CreateButton label="Strategy" buttonText="New Objective" title="New Strategy" fields={STRATEGY_FIELDS} endpoint="/api/strategies" />
          </>
        }
      />
      <StrategySubnav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Target} label="Active Goals" value={String(GOALS.length)} delta={`${GOALS.filter((g) => g.status === "Achieved").length} achieved`} tone="violet" />
        <KpiCard icon={TrendingUp} label="Campaigns Aligned" value={null} tone="pink" />
        <KpiCard icon={DollarSign} label="Planned Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} delta={`$${(totalSpend / 1000).toFixed(0)}K spent`} tone="green" />
        <KpiCard icon={TrendingUp} label="Forecast Revenue" value={null} tone="orange" />
        <KpiCard icon={HeartHandshake} label="Strategy Health" value={null} tone="blue" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Goals & Objectives</div>
            <Link href="/app/strategy/goals" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="space-y-3">
            {GOALS.slice(0, 4).map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.id} className="rounded-xl border border-line p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-[13px] font-semibold text-ink">{g.name}</div>
                    <StatusPill tone={GOAL_STATUS_TONE[g.status]}>{g.status}</StatusPill>
                  </div>
                  <div className="text-[11px] text-ink-muted">Target: {g.unit === "$" ? "$" : ""}{g.target.toLocaleString()}{g.unit && g.unit !== "$" ? g.unit : ""} · Due {g.dueDate}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-ink">{g.unit === "$" ? "$" : ""}{g.current.toLocaleString()}{g.unit && g.unit !== "$" ? g.unit : ""}</span>
                    <span className="font-bold text-emerald-600">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Strategic Pillars</div>
          <div className="space-y-3">
            {[
              { p: "AI-native execution", detail: "Every module ships with AI assist." },
              { p: "PLG + Sales-assisted", detail: "PQL scoring routes to Sales at 80+." },
              { p: "Enterprise governance", detail: "SSO, audit log, custom roles." },
              { p: "Content velocity", detail: "40 pieces/mo across blog, social, email." },
            ].map((r) => (
              <div key={r.p} className="rounded-xl border border-line p-3">
                <div className="text-[12.5px] font-semibold text-ink">{r.p}</div>
                <div className="text-[11px] text-ink-muted">{r.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Channel Allocation</div>
            <Link href="/app/strategy/channels" className="text-[12px] font-semibold text-violet">Details →</Link>
          </div>
          <div className="space-y-3">
            {CHANNELS.map((c) => {
              const pct = Math.round((c.plannedBudget / totalBudget) * 100);
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{c.name}</span>
                      <StatusPill tone={CHANNEL_TONE[c.status]}>{c.status}</StatusPill>
                    </div>
                    <span className="text-ink-soft">
                      <span className="font-bold text-ink">${(c.plannedBudget / 1000).toFixed(0)}K</span> · <span className="font-bold text-emerald-600">{c.roasActual}× ROAS</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Audience & Personas</div>
            <Link href="/app/strategy/personas" className="text-[12px] font-semibold text-violet">Details →</Link>
          </div>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold ${p.tone}`}>{p.logoLetter}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-ink">{p.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{(p.size / 1000).toFixed(1)}K · {p.channels.slice(0, 2).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Strategy Roadmap</div>
          <div className="relative space-y-4 border-l border-line pl-6">
            {[
              { q: "Q3 2026", label: "Ship AI Advisor v2 · Land 3 enterprise logos" },
              { q: "Q4 2026", label: "Reduce CAC 15% · Launch APAC partner motion" },
              { q: "Q1 2027", label: "Public LLM cost transparency · Vertical playbooks" },
            ].map((r) => (
              <div key={r.q} className="relative">
                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white bg-violet shadow" />
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet">{r.q}</div>
                <div className="mt-0.5 text-[12.5px] text-ink">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">SWOT</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11.5px]">
            {(Object.keys(SWOT) as (keyof typeof SWOT)[]).map((k) => {
              const tone = { Strengths: "bg-emerald-500/10 text-emerald-700", Weaknesses: "bg-amber-500/10 text-amber-700", Opportunities: "bg-violet/10 text-violet", Threats: "bg-red-500/10 text-red-700" }[k];
              return (
                <div key={k} className={`rounded-xl p-3 ${tone}`}>
                  <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider">{k}</div>
                  <ul className="space-y-0.5">
                    {SWOT[k].map((it) => <li key={it}>· {it}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
        <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> AI Recommendations → Take Action</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { title: "Launch webinar campaign", body: "AI Playbook webinar drove 340 SQLs last time. Rerun." },
            { title: "Ship comparison LP", body: "Amplivanta vs BuildRev demand up 18% MoM." },
            { title: "Retarget dormant Enterprise", body: "12 Enterprise trials expired without contact." },
          ].map((r, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-3">
              <div className="text-[12.5px] font-semibold text-ink">{r.title}</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{r.body}</p>
              <button className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-violet">Launch campaign <ArrowRight className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
