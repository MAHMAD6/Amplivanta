import type { Metadata } from "next";
import Link from "next/link";
import { Target, ClipboardCheck, Search, Users2, GitBranch, Database, Play, ArrowRight, CheckCircle2, Megaphone, Package, TrendingUp, Briefcase, Sparkles, BarChart3, PieChart } from "lucide-react";

export const metadata: Metadata = { title: "Growth Audit" };

const AREAS = [
  { icon: Target, tone: "green", title: "Strategy & Positioning", desc: "Evaluate your value proposition, messaging, and market positioning." },
  { icon: ClipboardCheck, tone: "violet", title: "Content & Messaging", desc: "Assess content quality, consistency, and alignment with audience needs." },
  { icon: Search, tone: "blue", title: "Visibility & Traffic", desc: "Review SEO, channels, traffic sources, and audience reach." },
  { icon: Users2, tone: "orange", title: "Conversion & Engagement", desc: "Analyze user experience, engagement, and conversion optimization." },
  { icon: GitBranch, tone: "green", title: "Sales & Pipeline", desc: "Evaluate lead quality, pipeline health, and revenue opportunities." },
  { icon: Database, tone: "violet", title: "Technology & Data", desc: "Assess your tools, data quality, and tracking infrastructure." },
];
const OPPS = ["High-impact opportunities to accelerate growth", "Quick wins you can implement now", "Priorities that deliver measurable results", "Strategic recommendations aligned to your goals", "A clear roadmap for sustainable growth"];
const STEPS = [
  { n: 1, title: "Answer a few questions", desc: "Share details about your business, goals, and current challenges." },
  { n: 2, title: "We analyze everything", desc: "Our AI and growth experts evaluate your data across key growth areas." },
  { n: 3, title: "Get your audit & roadmap", desc: "Receive a prioritized report with recommendations you can act on." },
];
const TEAMS = [
  { icon: Megaphone, title: "Marketing Teams", desc: "Improve strategy, campaigns, and content performance." },
  { icon: Users2, title: "Sales Teams", desc: "Better pipeline visibility and higher-quality leads." },
  { icon: Package, title: "Product Teams", desc: "Align products with market needs and user feedback." },
  { icon: TrendingUp, title: "Growth Managers", desc: "Prioritize initiatives that drive the biggest impact." },
  { icon: Briefcase, title: "Executives", desc: "Make data-backed decisions with confidence." },
];
const DONUT = [["Strategy & Positioning", "#16A56A"], ["Content & Messaging", "#6A35F0"], ["Visibility & Traffic", "#3B82F6"], ["Conversion & Engagement", "#F97316"], ["Sales & Pipeline", "#8B5CF6"], ["Technology & Data", "#0EA5E9"]] as const;
const TONE: Record<string, string> = { green: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet/10 text-violet", blue: "bg-blue-500/10 text-blue-600", orange: "bg-orange-brand/10 text-orange-brand" };

export default function GrowthAuditPage() {
  const grad = DONUT.map(([, c], i) => `${c} ${(i * 100) / 6}% ${((i + 1) * 100) / 6}%`).join(", ");
  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="inline-block rounded-full bg-violet/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet">Growth Audit™</span>
          <h1 className="mt-4 font-display text-[34px] font-extrabold leading-[1.1] text-ink lg:text-[40px]">Growth Audit™ for Clearer, Faster Growth Decisions</h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-ink-soft">Get a comprehensive, objective audit of your marketing, sales, and digital presence—so you can focus on what matters most and grow with confidence.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app/ai-advisor" className="inline-flex h-12 items-center gap-2 rounded-xl bg-grad-cta px-6 text-[14px] font-bold text-white shadow-violet">Start Your Free Audit <ArrowRight className="h-4 w-4" /></Link>
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-line px-6 text-[14px] font-bold text-ink hover:border-violet/40">See How It Works <Play className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="text-[14px] font-bold text-ink">Your Audit Preview</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${grad})` }}><div className="absolute inset-[26%] rounded-full bg-white" /></div>
            <ul className="space-y-1 text-[11px]">
              {DONUT.map(([label, c]) => <li key={label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} /><span className="text-ink-soft">{label}</span></li>)}
            </ul>
          </div>
          <div className="mt-4 flex gap-2 rounded-xl bg-bg-soft/60 p-3"><Sparkles className="h-4 w-4 shrink-0 text-violet" /><p className="text-[11.5px] text-ink-soft">Get a clear view of what&apos;s working well, opportunities to improve, and the next best actions to drive growth.</p></div>
        </div>
      </section>

      {/* Areas */}
      <Section title="A complete audit. Focused on what drives growth." sub="Our Growth Audit evaluates the key areas that impact your business performance.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {AREAS.map((a) => (
            <div key={a.title} className="rounded-2xl border border-line bg-white p-4 text-center shadow-card">
              <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${TONE[a.tone]}`}><a.icon className="h-5 w-5" /></span>
              <div className="mt-2.5 text-[12.5px] font-bold text-ink">{a.title}</div>
              <p className="mt-1 text-[10.5px] leading-snug text-ink-soft">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Opportunities */}
      <Section title="Spot growth opportunities. Take action with confidence." sub="We highlight what's working, where to improve, and the opportunities with the greatest impact.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {OPPS.map((o) => (
            <div key={o} className="rounded-xl border border-line bg-white p-4 shadow-card"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-[12px] leading-snug text-ink-soft">{o}</p></div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title="How the Growth Audit works" sub="Three simple steps from insight to impact.">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet/10 text-[13px] font-bold text-violet">{s.n}</span><div className="text-[14px] font-bold text-ink">{s.title}</div></div>
              <p className="mt-2 text-[12.5px] text-ink-soft">{s.desc}</p>
              <div className="mt-3 flex items-center gap-2 text-ink-muted">{i === 1 ? <><BarChart3 className="h-5 w-5" /><PieChart className="h-5 w-5" /></> : <div className="h-1 w-16 rounded bg-line" />}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Teams */}
      <Section title="Built for growth-focused teams" sub="Whether you're scaling a startup or leading an enterprise, the Growth Audit gives your team the clarity to move forward.">
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
        <div className="flex items-center gap-3"><Sparkles className="h-6 w-6" /><div><div className="text-[16px] font-bold">Ready to uncover your next growth opportunity?</div><div className="text-[13px] text-white/80">Start your free Growth Audit today—no credit card required.</div></div></div>
        <Link href="/app/ai-advisor" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-violet">Start Your Free Audit <ArrowRight className="h-4 w-4" /></Link>
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
