import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight, Newspaper, BookOpen, PlayCircle, Presentation, LayoutTemplate, LifeBuoy, Code2, Rocket, Target, Settings2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "Resources Hub" };

const CATEGORIES = [
  { icon: Newspaper, name: "Blog", hint: "Insights, strategies, and industry trends.", href: "/app/resources/blog", tone: "blue" },
  { icon: BookOpen, name: "Knowledge Base", hint: "How-to articles and documentation.", href: "/app/resources/knowledge-base", tone: "violet" },
  { icon: PlayCircle, name: "Videos", hint: "Tutorials, product demos, and expert talks.", href: "/app/resources/videos", tone: "pink" },
  { icon: Presentation, name: "Webinars", hint: "Live and on-demand sessions with leaders.", href: "/app/resources/webinars", tone: "teal" },
  { icon: LayoutTemplate, name: "Templates", hint: "Ready-to-use templates to save time.", href: "/app/resources/templates", tone: "orange" },
  { icon: LifeBuoy, name: "Help Center", hint: "Get support and answers to common questions.", href: "/app/resources/help-center", tone: "indigo" },
];
const FEATURED = [
  { tag: "BLOG", title: "10 Growth Engineering Strategies for 2026", hint: "Actionable strategies to accelerate growth and outperform competitors.", cta: "Read article", grad: "from-violet to-indigo-600" },
  { tag: "VIDEO", title: "Amplivanta Platform Walkthrough: From Setup to Scale", hint: "See how Amplivanta unifies marketing, automation, and analytics.", cta: "Watch now", grad: "from-slate-800 to-slate-900" },
  { tag: "TEMPLATE", title: "Content Calendar Template for Growth Teams", hint: "Plan, organize, and execute content that drives engagement.", cta: "Open template", grad: "from-orange-brand to-amber-500" },
];
const PATHS = [
  { icon: Rocket, name: "Getting Started", hint: "Kick off your journey with Amplivanta and get up to speed quickly.", meta: "5 modules · 25 min", tone: "blue" },
  { icon: Target, name: "Growth Strategy", hint: "Build data-driven strategies that drive sustainable business growth.", meta: "6 modules · 45 min", tone: "violet" },
  { icon: Settings2, name: "Automation Mastery", hint: "Master automation to save time, scale workflows, and drive impact.", meta: "7 modules · 60 min", tone: "teal" },
];
const LATEST = [
  ["How to Build a High-Converting Landing Page", "Blog", "Conversion", "May 21, 2026"],
  ["Lead Scoring Best Practices", "Article", "CRM", "May 19, 2026"],
  ["Marketing Automation: Save Time, Drive Results", "Video", "Automation", "May 16, 2026"],
  ["Q2 Growth Strategy Webinar", "Webinar", "Strategy", "May 14, 2026"],
  ["Email Nurture Sequence Template", "Template", "Email Marketing", "May 12, 2026"],
] as const;
const TYPE_TONE: Record<string, "blue" | "violet" | "pink" | "teal" | "orange"> = { Blog: "blue", Article: "violet", Video: "pink", Webinar: "teal", Template: "orange" };
const TONE: Record<string, string> = { blue: "bg-blue-500/10 text-blue-600", violet: "bg-violet/10 text-violet", pink: "bg-pink-brand/10 text-pink-brand", teal: "bg-teal-500/10 text-teal-600", orange: "bg-orange-brand/10 text-orange-brand", indigo: "bg-indigo-500/10 text-indigo-600" };

export default function ResourcesHubPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader title="Resources Hub" subtitle="Explore expert content, practical resources, and growth insights in one place." />

      {/* Hero search */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-grad-cta px-5 text-[13px] font-bold text-white shadow-violet"><Search className="h-4 w-4" /> Search Resources</button>
        <Link href="/app/growth-audit" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-ink hover:border-ink/30">Start Engineering Growth <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {/* Category cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link key={c.name} href={c.href} className="rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-violet/30">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE[c.tone]}`}><c.icon className="h-5 w-5" /></div>
            <div className="mt-3 text-[14px] font-bold text-ink">{c.name}</div>
            <div className="mt-1 text-[11.5px] text-ink-muted">{c.hint}</div>
            <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-violet">Explore <ArrowRight className="h-3 w-3" /></span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Featured */}
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold text-ink">Featured Resources</h2><a className="text-[12px] font-semibold text-violet">View all</a></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {FEATURED.map((f) => (
                <div key={f.title} className={`flex flex-col justify-between rounded-2xl bg-gradient-to-br ${f.grad} p-5 text-white shadow-card`}>
                  <div>
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold">{f.tag}</span>
                    <div className="mt-3 text-[15px] font-bold leading-snug">{f.title}</div>
                    <div className="mt-2 text-[12px] text-white/80">{f.hint}</div>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold">{f.cta} <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              ))}
            </div>
          </section>

          {/* Learning paths */}
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold text-ink">Learning Paths</h2><a className="text-[12px] font-semibold text-violet">View all</a></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PATHS.map((p) => (
                <div key={p.name} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center gap-2.5"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${TONE[p.tone]}`}><p.icon className="h-5 w-5" /></div><div className="text-[14px] font-bold text-ink">{p.name}</div></div>
                  <p className="mt-2 text-[12px] text-ink-soft">{p.hint}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted"><span>{p.meta}</span><span>0%</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full w-0 rounded-full bg-grad-brand" /></div>
                </div>
              ))}
            </div>
          </section>

          {/* Latest */}
          <section className="rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="text-[15px] font-bold text-ink">Latest Resources</h2><a className="text-[12px] font-semibold text-violet">View all</a></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted"><th className="px-4 py-2.5 font-semibold">Resource Title</th><th className="px-3 py-2.5 font-semibold">Type</th><th className="px-3 py-2.5 font-semibold">Category</th><th className="px-3 py-2.5 font-semibold">Date</th><th className="px-3 py-2.5 font-semibold">Action</th></tr></thead>
                <tbody>
                  {LATEST.map(([title, type, cat, date]) => (
                    <tr key={title} className="border-b border-line/60 hover:bg-bg-soft/50">
                      <td className="px-4 py-2.5 font-medium text-ink">{title}</td>
                      <td className="px-3 py-2.5"><StatusPill tone={TYPE_TONE[type]}>{type}</StatusPill></td>
                      <td className="px-3 py-2.5 text-ink-soft">{cat}</td>
                      <td className="px-3 py-2.5 text-ink-muted">{date}</td>
                      <td className="px-3 py-2.5"><ExternalLink className="h-4 w-4 text-ink-muted" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-[12px] text-ink-muted">Showing 1 to 5 of 5 resources</div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-bold text-ink">Filters</span><a className="text-[11px] font-semibold text-violet">Clear all</a></div>
            {["Resource Type", "Topic", "Skill Level", "Content Format"].map((f) => (
              <label key={f} className="mb-3 block"><span className="mb-1 block text-[11.5px] font-semibold text-ink">{f}</span><select className="h-9 w-full rounded-xl border border-line bg-white px-3 text-[12.5px]"><option>All {f.split(" ")[0]}s</option></select></label>
            ))}
            <button className="mt-1 h-10 w-full rounded-xl bg-violet text-[13px] font-bold text-white">Apply Filters</button>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Developer Resources</div>
            <div className="flex items-start gap-2.5"><Code2 className="h-4 w-4 shrink-0 text-violet" /><div><div className="text-[12.5px] font-semibold text-ink">API Docs</div><div className="text-[11px] text-ink-muted">Developer documentation and API references.</div><a className="mt-1 inline-block text-[12px] font-semibold text-violet">View API Docs →</a></div></div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between text-[13px] font-bold text-ink"><span>Recently Viewed</span><a className="text-[11px] font-semibold text-violet">View all</a></div>
            <ul className="space-y-2 text-[12px] text-ink-soft">
              <li>Amplivanta Platform Walkthrough <span className="text-ink-muted">· Video</span></li>
              <li>Email Nurture Sequence Template <span className="text-ink-muted">· Template</span></li>
              <li>Marketing Automation: Save Time <span className="text-ink-muted">· Video</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
