import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Search, Target, ClipboardCheck, BarChart3, Users2, MousePointerClick, MessageSquare, CircleDollarSign, TrendingUp, Mail, ArrowRight, ChevronRight, Cloud, Zap, Megaphone, Package, Briefcase } from "lucide-react";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "AI Advisor" };

const VALUES = [
  { icon: Search, tone: "green", title: "Find opportunities", desc: "Surface high-impact growth opportunities across your marketing, sales, and customer data." },
  { icon: Target, tone: "violet", title: "Prioritize what matters", desc: "Get AI-backed recommendations ranked by potential impact and effort so you focus on what moves the needle." },
  { icon: ClipboardCheck, tone: "blue", title: "Take confident action", desc: "Follow clear, step-by-step action plans to implement changes and drive results." },
  { icon: BarChart3, tone: "orange", title: "Measure & improve", desc: "Track progress over time and continuously improve with smarter insights." },
];
const OPP_AREAS = [
  { icon: Users2, title: "Traffic & Acquisition", desc: "Improve channel mix and attract more qualified visitors." },
  { icon: MousePointerClick, title: "Conversion Optimization", desc: "Optimize key pages and journeys to convert more users." },
  { icon: MessageSquare, title: "Engagement & Retention", desc: "Build stronger relationships and increase repeat business." },
  { icon: CircleDollarSign, title: "Revenue Growth", desc: "Increase average order value and expand revenue." },
];
const ACTIONS = [
  { icon: TrendingUp, title: "Optimize landing page conversion", meta: "High impact  •  Estimated uplift: High", tag: "High", tone: "green" as const },
  { icon: Mail, title: "Re-engage inactive leads", meta: "Medium impact  •  Estimated uplift: Medium", tag: "Medium", tone: "amber" as const },
  { icon: Users2, title: "Expand high-performing audience", meta: "High impact  •  Estimated uplift: High", tag: "High", tone: "green" as const },
];
const INTEL = [
  { icon: Search, tone: "green", title: "Deep data analysis", desc: "Uncover patterns and opportunities across marketing, sales, and product data." },
  { icon: Target, tone: "violet", title: "Smart recommendations", desc: "Get prioritized, actionable recommendations tailored to your goals." },
  { icon: ClipboardCheck, tone: "blue", title: "Actionable roadmaps", desc: "Turn insights into clear, step-by-step plans that drive results." },
  { icon: BarChart3, tone: "orange", title: "Measure & improve", desc: "Track progress and get continuous guidance to improve outcomes." },
];
const STEPS = [
  { icon: Cloud, tone: "blue", n: 1, title: "Connect & analyze", desc: "Connect your data sources. Our AI analyzes performance and market signals." },
  { icon: Sparkles, tone: "violet", n: 2, title: "Get AI insights", desc: "See your growth opportunities, prioritized by impact, effort, and confidence." },
  { icon: Zap, tone: "green", n: 3, title: "Take action & grow", desc: "Implement recommended actions, track results, and keep improving." },
];
const TEAMS = [
  { icon: Megaphone, title: "Marketing Teams", desc: "Optimize campaigns, improve ROI, and drive more qualified leads." },
  { icon: CircleDollarSign, title: "Sales Teams", desc: "Increase pipeline, improve win rates, and forecast accurately." },
  { icon: Package, title: "Product Teams", desc: "Understand user behavior and build what drives growth." },
  { icon: TrendingUp, title: "Growth Managers", desc: "Prioritize what matters and align efforts across channels." },
  { icon: Briefcase, title: "Executives", desc: "Make data-backed decisions that drive sustainable growth." },
];
const TONE: Record<string, string> = { green: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet/10 text-violet", blue: "bg-blue-500/10 text-blue-600", orange: "bg-orange-brand/10 text-orange-brand" };

export default function AiAdvisorPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] text-ink lg:text-[40px]">AI Advisor for Smarter Growth Decisions</h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-ink-soft">Get AI-powered insights, tailored recommendations, and clear action steps to accelerate your growth.</p>
        </div>
        <div className="rounded-2xl border border-line bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand-2 text-white shadow-violet"><Sparkles className="h-6 w-6" /></span>
            <div className="flex-1 space-y-1.5">
              {[80, 60, 70].map((w, i) => <div key={i} className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet/15 text-[8px] text-violet">✓</span><div className="h-2 rounded bg-line" style={{ width: `${w}%` }} /></div>)}
            </div>
          </div>
          <div className="mt-4 flex items-end gap-1.5">{[40, 65, 50, 80, 70].map((h, i) => <div key={i} className="flex-1 rounded-t bg-violet/60" style={{ height: `${h}px` }} />)}</div>
        </div>
      </section>

      {/* Value props */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="text-center">
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${TONE[v.tone]}`}><v.icon className="h-6 w-6" /></span>
            <div className="mt-3 text-[14px] font-bold text-ink">{v.title}</div>
            <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Advisor Overview */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-ink">Advisor Overview</h2>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold text-ink">Last 30 days ▾</button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[12.5px] font-bold text-ink-soft">Opportunity Areas</div>
            <div className="space-y-2">
              {OPP_AREAS.map((o) => (
                <div key={o.title} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet"><o.icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-bold text-ink">{o.title}</div><p className="text-[11.5px] text-ink-soft">{o.desc}</p></div>
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12.5px] font-bold text-ink-soft">Top Recommended Actions</div>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <div key={a.title} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet"><a.icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-bold text-ink">{a.title}</div><p className="text-[11px] text-ink-muted">{a.meta}</p></div>
                  <StatusPill tone={a.tone}>{a.tag}</StatusPill>
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </div>
              ))}
            </div>
            <Link href="/app/ai-advisor/history" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">View all recommendations <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Growth intelligence */}
      <Section title="AI-Powered Growth Intelligence" sub="Advanced AI models analyze your data to deliver the right insight at the right time.">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {INTEL.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE[f.tone]}`}><f.icon className="h-5 w-5" /></span>
              <div><div className="text-[13.5px] font-bold text-ink">{f.title}</div><p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title="How the Growth Advisor Works" sub="From insight to impact in three steps.">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE[s.tone]}`}><s.icon className="h-5 w-5" /></span>
              <div className="mt-3 text-[14px] font-bold text-ink">{s.n}. {s.title}</div>
              <p className="mt-1 text-[12.5px] text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Teams */}
      <Section title="Built for Growth-Focused Teams" sub="Insights designed for every role that drives growth.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEAMS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><t.icon className="h-4 w-4" /></span>
              <div className="mt-2.5 text-[12.5px] font-bold text-ink">{t.title}</div>
              <p className="mt-1 text-[11px] leading-snug text-ink-soft">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-grad-brand-2 p-6 text-white shadow-violet">
        <div className="flex items-center gap-3"><Sparkles className="h-6 w-6" /><div><div className="text-[16px] font-bold">Ready to unlock your next growth opportunity?</div><div className="text-[13px] text-white/80">Let AI guide your next best move.</div></div></div>
        <Link href="/app/ai-advisor/ask" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-violet">Start Engineering Growth <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-[22px] font-extrabold text-ink">{title}</h2>
      {sub && <p className="mt-1.5 max-w-3xl text-[13px] text-ink-soft">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
