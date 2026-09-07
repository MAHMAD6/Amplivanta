import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Megaphone, Workflow, Mail, FileText, Layout, Users2, BarChart3, Play, ArrowRight, UserPlus, Send, GitBranch, Zap, CircleCheckBig, ShoppingBag, Package, Briefcase, Boxes, Rocket, Globe, Layers } from "lucide-react";

export const metadata: Metadata = { title: "Marketing Automation", description: "Automate smarter and grow consistently with Amplivanta Marketing Automation." };

const NAV = [["Overview", LayoutGrid], ["Campaigns", Megaphone], ["Workflows", Workflow], ["Email Campaigns", Mail], ["Lead Capture Forms", FileText], ["Landing Pages", Layout], ["Audience", Users2], ["Reports", BarChart3]] as const;
const KPIS = [["Active Workflows", "Running"], ["Active Campaigns", "In progress"], ["New Leads", "This period"]] as const;
const ACTS = [["Welcome Email – New Subscribers", "Sent", "Just now"], ["Product Launch Campaign", "Workflow updated", "1h ago"], ["Lead Capture Form", "New submission received", "2h ago"]] as const;
const FLOW = [["Lead Captured", GitBranch], ["Welcome Email", Mail], ["Nurture Sequence", Users2], ["Converted", CircleCheckBig]] as const;

const AUTOMATE = [
  { icon: UserPlus, tone: "green", title: "Attract", desc: "Capture leads with forms, landing pages, and engaging content." },
  { icon: Mail, tone: "violet", title: "Nurture", desc: "Send the right message at the right time with automated email campaigns." },
  { icon: GitBranch, tone: "blue", title: "Segment", desc: "Group your audience by behavior, interests, and stage in the journey." },
  { icon: Zap, tone: "orange", title: "Automate", desc: "Create workflows that respond to actions and guide leads forward." },
  { icon: CircleCheckBig, tone: "green", title: "Convert", desc: "Turn qualified leads into customers with personalized experiences." },
  { icon: BarChart3, tone: "violet", title: "Analyze", desc: "Track performance and refine what works to improve outcomes." },
];
const CAPS = [
  { icon: Mail, tone: "green", title: "Email Campaigns", desc: "Design, send, and track emails that connect and convert." },
  { icon: FileText, tone: "violet", title: "Lead Capture Forms", desc: "Create forms that capture leads and sync seamlessly with your CRM." },
  { icon: Layout, tone: "blue", title: "Landing Pages", desc: "Launch high-converting pages without code and drive more sign-ups." },
  { icon: Workflow, tone: "orange", title: "Workflow Automation", desc: "Build automations that trigger actions and keep your audience moving." },
  { icon: Users2, tone: "green", title: "Audience Management", desc: "Organize contacts, manage segments, and keep your data clean and actionable." },
  { icon: BarChart3, tone: "violet", title: "Reports & Insights", desc: "See key insights on performance and make data-informed decisions." },
];
const TEAMS = [
  { icon: Megaphone, tone: "green", title: "Marketing Teams", desc: "Run campaigns that engage audiences and drive results." },
  { icon: Users2, tone: "violet", title: "Sales Teams", desc: "Nurture leads and have better conversations." },
  { icon: ShoppingBag, tone: "blue", title: "E-commerce", desc: "Automate journeys that increase engagement and boost sales." },
  { icon: Package, tone: "orange", title: "Product Teams", desc: "Onboard users and drive activation with targeted messaging." },
  { icon: Briefcase, tone: "green", title: "Business Owners", desc: "Save time, streamline processes, and grow your business." },
];
const TONE: Record<string, string> = { green: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet/10 text-violet", blue: "bg-blue-500/10 text-blue-600", orange: "bg-orange-brand/10 text-orange-brand" };

export default function MarketingAutomationPage() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1240px] items-start gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-block rounded-full bg-royal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-royal-blue">Marketing Automation</span>
            <h1 className="mt-4 font-display text-[44px] font-extrabold leading-[1.05] text-deep-navy lg:text-[52px]">Automate Smarter. Grow Consistently.</h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">Amplivanta Marketing Automation helps you attract the right audience, nurture leads, and convert with personalized experiences—across every channel.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 text-[14px] font-bold text-white hover:bg-deep-panel">Explore Marketing Automation <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/demo" className="inline-flex h-12 items-center gap-2 rounded-xl border border-line px-6 text-[14px] font-bold text-deep-navy hover:border-royal-blue/40">See How It Works <Play className="h-4 w-4" /></Link>
            </div>
          </div>
          <PreviewPanel />
        </div>
      </section>

      <Section title="What you can automate" sub="Build meaningful journeys that engage your audience and move them closer to becoming loyal customers.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {AUTOMATE.map((c) => (
            <div key={c.title} className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${TONE[c.tone]}`}><c.icon className="h-6 w-6" /></span>
              <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{c.title}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Powerful capabilities to drive results" sub="Everything you need to run, optimize, and scale your marketing—all in one place." bg>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE[f.tone]}`}><f.icon className="h-5 w-5" /></span>
              <div><div className="text-[14px] font-bold text-deep-navy">{f.title}</div><p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Built for growth-focused teams" sub="Whether you're a startup or an established business, our tools help every team work smarter.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEAMS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONE[t.tone]}`}><t.icon className="h-4 w-4" /></span>
              <div className="mt-2.5 text-[13.5px] font-bold text-deep-navy">{t.title}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1240px] px-4 lg:px-8">
          <div className="rounded-3xl bg-deep-navy p-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Rocket className="h-6 w-6" /></span>
                <div><div className="font-display text-[22px] font-extrabold">Ready to automate your growth?</div><div className="text-[13px] text-white/70">Create powerful customer journeys that drive real results.</div></div>
              </div>
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14px] font-bold text-deep-navy hover:bg-white/90">Explore Marketing Automation <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-8 border-t border-white/10 pt-5 text-[13px] text-white/70">
              <span className="inline-flex items-center gap-2"><Layers className="h-4 w-4" /> All-in-one platform</span>
              <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4" /> Easy to build and scale</span>
              <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4" /> Works across every channel</span>
              <span className="inline-flex items-center gap-2"><Boxes className="h-4 w-4" /> Built for your business</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, sub, children, bg }: { title: string; sub?: string; children: React.ReactNode; bg?: boolean }) {
  return (
    <section className={bg ? "bg-bg-soft/40 py-12" : "bg-white py-12"}>
      <div className="mx-auto max-w-[1240px] px-4 lg:px-8">
        <h2 className="font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
        {sub && <p className="mt-1.5 max-w-3xl text-[13.5px] text-ink-soft">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function PreviewPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card-lg">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[15px] font-bold text-deep-navy">Marketing Automation Dashboard</span>
        <span className="rounded bg-royal-tint px-2 py-0.5 text-[9px] font-semibold text-royal-blue">Sample data</span>
      </div>
      <div className="grid grid-cols-[140px_1fr]">
        <aside className="border-r border-line p-2">
          {NAV.map(([label, Icon], i) => (
            <div key={label} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10.5px] ${i === 0 ? "bg-royal-tint font-semibold text-royal-blue" : "text-ink-soft"}`}><Icon className="h-3.5 w-3.5" /> {label}</div>
          ))}
        </aside>
        <div className="min-w-0 p-3">
          <div className="grid grid-cols-3 gap-2">
            {KPIS.map(([label, status]) => (
              <div key={label} className="rounded-lg border border-line p-2"><div className="text-[10px] font-semibold text-deep-navy">{label}</div><div className="mt-1 text-[8.5px] text-emerald-600">{status}</div></div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-line p-2.5">
            <div className="text-[11px] font-bold text-deep-navy">Recent Activity</div>
            {ACTS.map(([a, s, w]) => (
              <div key={a} className="mt-1.5 flex items-center justify-between text-[9px]"><span className="min-w-0 flex-1 truncate font-medium text-ink">{a}</span><span className="ml-2 text-ink-muted">{w}</span></div>
            ))}
          </div>
          <div className="mt-3 text-[11px] font-bold text-deep-navy">Workflow Snapshot</div>
          <div className="mt-1.5 flex items-center gap-1">
            {FLOW.map(([label, Icon], i) => (
              <div key={label} className="flex items-center gap-1">
                <div className="flex flex-col items-center"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-royal-blue"><Icon className="h-4 w-4" /></span><span className="mt-0.5 text-[7.5px] text-ink-soft">{label}</span></div>
                {i < FLOW.length - 1 && <ArrowRight className="h-3 w-3 text-ink-muted" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
