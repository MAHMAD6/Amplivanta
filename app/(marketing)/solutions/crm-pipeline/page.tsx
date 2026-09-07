import type { Metadata } from "next";
import Link from "next/link";
import { Users2, Building2, CircleDollarSign, ListTodo, BarChart3, Play, ArrowRight, Contact, Handshake, Filter, ClipboardList, Activity, FileText, Settings, Mail, Bell, SlidersHorizontal, UserPlus, Megaphone, Heart, Cog, Crown, Database, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "CRM & Pipeline", description: "Build stronger relationships and grow revenue with Amplivanta CRM." };

const NAV = [["Overview", Contact], ["Contacts", Users2], ["Companies", Building2], ["Deals", Handshake], ["Pipeline", Filter], ["Tasks", ClipboardList], ["Activities", Activity], ["Reports", FileText], ["Settings", Settings]] as const;
const KPIS = [["New Leads", Users2], ["Open Deals", CircleDollarSign], ["Tasks Due", ClipboardList], ["Follow-ups", Heart]] as const;
const STAGES = [["New", "Leads entering your pipeline"], ["Qualified", "Leads that meet your criteria"], ["Proposal", "Proposals sent to prospects"], ["Won", "Deals closed successfully"]] as const;
const ACTS = [["Follow-up call", "Contact", "Today"], ["Meeting scheduled", "Deal", "Yesterday"], ["Email sent", "Contact", "2 days ago"], ["Task completed", "Task", "3 days ago"]] as const;

const NEED = [
  { icon: Users2, tone: "green", title: "Contact Management", desc: "Store, organize, and access all your contacts in one central place." },
  { icon: Filter, tone: "violet", title: "Pipeline Management", desc: "Visualize your sales pipeline, track progress, and focus on what matters." },
  { icon: CircleDollarSign, tone: "green", title: "Deal Tracking", desc: "Track deals from first contact to close with clear stages and visibility." },
  { icon: ClipboardList, tone: "orange", title: "Task & Activity", desc: "Stay on top of tasks, follow-ups, and team activities." },
  { icon: BarChart3, tone: "blue", title: "Reports & Insights", desc: "Understand your pipeline health and make smarter, data-driven decisions." },
];
const FEATURES = [
  { icon: FileText, tone: "green", title: "Lead Capture & Tracking", desc: "Capture leads from any source and track them through your pipeline." },
  { icon: Building2, tone: "violet", title: "Company Management", desc: "Manage companies and relationships to strengthen every connection." },
  { icon: Mail, tone: "orange", title: "Email Integration", desc: "Sync emails, log conversations, and keep every interaction in context." },
  { icon: UserPlus, tone: "blue", title: "Team Collaboration", desc: "Collaborate, assign ownership, and share updates with your team." },
  { icon: Bell, tone: "green", title: "Reminders & Notifications", desc: "Never miss a follow-up with smart reminders and notifications." },
  { icon: SlidersHorizontal, tone: "violet", title: "Seamless Integrations", desc: "Connect with the tools you use every day to keep everything in sync." },
];
const TEAMS = [
  { icon: TrendingUp, tone: "green", title: "Sales Teams", desc: "Close more deals and shorten sales cycles." },
  { icon: Megaphone, tone: "violet", title: "Marketing Teams", desc: "Capture better leads and nurture stronger relationships." },
  { icon: Heart, tone: "blue", title: "Customer Success", desc: "Build loyalty and deliver exceptional customer experiences." },
  { icon: Cog, tone: "orange", title: "Operations", desc: "Streamline processes and improve team productivity." },
  { icon: Crown, tone: "green", title: "Leadership", desc: "Get a clear view of your pipeline and make better decisions." },
];
const TONE: Record<string, string> = { green: "bg-emerald-500/10 text-emerald-600", violet: "bg-violet/10 text-violet", blue: "bg-blue-500/10 text-blue-600", orange: "bg-orange-brand/10 text-orange-brand" };

export default function CrmPipelinePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto grid grid-cols-1 max-w-[1240px] items-start gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-block rounded-full bg-royal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-royal-blue">CRM &amp; Pipeline</span>
            <h1 className="mt-4 font-display text-[44px] font-extrabold leading-[1.05] text-deep-navy lg:text-[52px]">Build Stronger Relationships. Grow Revenue.</h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">Amplivanta CRM helps you manage leads, track opportunities, and build lasting customer relationships—all in one place.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 text-[14px] font-bold text-white hover:bg-deep-panel">Explore CRM <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/demo" className="inline-flex h-12 items-center gap-2 rounded-xl border border-line px-6 text-[14px] font-bold text-deep-navy hover:border-royal-blue/40">See How It Works <Play className="h-4 w-4" /></Link>
            </div>
          </div>
          <PreviewPanel />
        </div>
      </section>

      <Section title="Everything you need to manage customer relationships">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {NEED.map((c) => <FeatureCard key={c.title} {...c} center />)}
        </div>
      </Section>

      <Section title="Powerful features for growing businesses" bg>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE[f.tone]}`}><f.icon className="h-5 w-5" /></span>
              <div><div className="text-[14px] font-bold text-deep-navy">{f.title}</div><p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Built for teams across your organization">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEAMS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONE[t.tone]}`}><t.icon className="h-4 w-4" /></span>
              <div className="mt-2.5 text-[13.5px] font-bold text-deep-navy">{t.title}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA band */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1240px] px-4 lg:px-8">
          <div className="rounded-3xl bg-deep-navy p-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Sparkles className="h-6 w-6" /></span>
                <div><div className="font-display text-[22px] font-extrabold">Manage relationships. Drive growth.</div><div className="text-[13px] text-white/70">Bring your leads, teams, and opportunities together in one powerful CRM.</div></div>
              </div>
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14px] font-bold text-deep-navy hover:bg-white/90">Explore CRM <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-8 border-t border-white/10 pt-5 text-[13px] text-white/70">
              <span className="inline-flex items-center gap-2"><Database className="h-4 w-4" /> Centralize your data</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Stay organized</span>
              <span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Close more deals</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, children, bg }: { title: string; children: React.ReactNode; bg?: boolean }) {
  return (
    <section className={bg ? "bg-bg-soft/40 py-12" : "bg-white py-12"}>
      <div className="mx-auto max-w-[1240px] px-4 lg:px-8">
        <h2 className="font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
function FeatureCard({ icon: Icon, tone, title, desc, center }: { icon: typeof Users2; tone: string; title: string; desc: string; center?: boolean }) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-5 shadow-card ${center ? "text-center" : ""}`}>
      <span className={`${center ? "mx-auto " : ""}flex h-12 w-12 items-center justify-center rounded-full ${TONE[tone]}`}><Icon className="h-6 w-6" /></span>
      <div className="mt-3 text-[14px] font-bold text-deep-navy">{title}</div>
      <p className="mt-1 text-[12px] leading-snug text-ink-soft">{desc}</p>
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card-lg">
      <div className="border-b border-line px-4 py-3 text-[15px] font-bold text-deep-navy">CRM Overview</div>
      <div className="grid grid-cols-[130px_1fr]">
        <aside className="border-r border-line p-2">
          {NAV.map(([label, Icon], i) => (
            <div key={label} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] ${i === 0 ? "bg-royal-tint font-semibold text-royal-blue" : "text-ink-soft"}`}><Icon className="h-3.5 w-3.5" /> {label}</div>
          ))}
        </aside>
        <div className="min-w-0 p-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {KPIS.map(([label, Icon]) => (
              <div key={label} className="rounded-lg border border-line p-2"><div className="text-[10px] font-semibold text-deep-navy">{label}</div><div className="mt-1 flex items-center gap-1 text-[9px] text-ink-muted"><Icon className="h-3 w-3 text-royal-blue" /> This period</div></div>
            ))}
          </div>
          <div className="mt-3 text-[11px] font-bold text-deep-navy">Pipeline Overview</div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STAGES.map(([s, d]) => (
              <div key={s} className="rounded-lg bg-bg-soft/60 p-2"><div className="text-[10px] font-semibold text-royal-blue">{s}</div><div className="mt-0.5 text-[8.5px] text-ink-muted">{d}</div><div className="mt-1.5 h-1 rounded bg-line" /></div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-line p-2.5">
            <div className="text-[11px] font-bold text-deep-navy">Recent Activities</div>
            {ACTS.map(([a, t, w]) => (
              <div key={a} className="mt-1.5 flex items-center justify-between text-[9.5px]"><span className="font-medium text-ink">{a}</span><span className="text-ink-muted">{t}</span><span className="text-ink-muted">{w}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
