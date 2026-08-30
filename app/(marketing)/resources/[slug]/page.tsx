import { notFound } from "next/navigation";
import Link from "next/link";
import { RESOURCE_PAGES } from "@/lib/marketing-modules";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { Search, Newspaper, BookOpen, PlayCircle, Presentation, FileText, LayoutTemplate, Download, Linkedin, Twitter, Facebook, Link2, Info, Check, ArrowRight, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return Object.keys(RESOURCE_PAGES).filter((k) => k !== "index").map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = RESOURCE_PAGES[slug];
  if (!data) return {};
  return { title: `${data.eyebrow} — Amplivanta`, description: data.subtitle };
}

const BROWSE = [
  { icon: LayoutTemplate, label: "All Resources" },
  { icon: Newspaper, label: "Blog" },
  { icon: FileText, label: "Guides" },
  { icon: BookOpen, label: "Whitepapers" },
  { icon: Presentation, label: "Webinars" },
  { icon: PlayCircle, label: "Case Studies" },
];
const TOPICS = ["Marketing Automation", "Growth Strategy", "Analytics & Reporting", "CRM & Pipeline", "AI & Intelligence", "Social Publishing"];
const SECTIONS = [
  { heading: "Start with a Clear Strategy", body: "Define your business objectives, target audience, and key metrics before building any workflows. A strong strategy ensures every effort supports growth.", bullets: ["Align goals with business outcomes", "Identify high-impact use cases", "Map the customer journey"] },
  { heading: "Build Smarter Workflows", body: "Design workflows that deliver the right message at the right time based on behavior, intent, and lifecycle stage.", bullets: ["Use triggers and behaviors to automate actions", "Personalize content and offers", "Keep workflows simple and purposeful"] },
  { heading: "Measure, Optimize, Repeat", body: "Track performance, test continuously, and refine based on data. Optimization is what turns good work into great results.", bullets: ["Monitor KPIs and conversion metrics", "A/B test content, timing, and channels", "Iterate and improve continuously"] },
];
const TOC = [...SECTIONS.map((s) => s.heading), "Tools That Help", "Common Pitfalls to Avoid", "Final Thoughts", "Related Resources"];
const RELATED = [
  { tag: "GUIDE", title: "Lead Nurturing Strategies That Convert", meta: "10 min read" },
  { tag: "WEBINAR", title: "Build Workflows That Drive Revenue", meta: "Watch on demand" },
  { tag: "TEMPLATE", title: "Marketing Automation Planning Template", meta: "Free download" },
];

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = RESOURCE_PAGES[slug];
  if (!data) notFound();

  return (
    <section className="bg-white py-8">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 lg:grid-cols-[220px_1fr_240px] lg:px-8">
        {/* Left browse */}
        <aside className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Browse Resources</div>
          <div className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-line bg-bg-soft px-2.5"><Search className="h-3.5 w-3.5 text-ink-muted" /><input placeholder="Search resources…" className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none" /></div>
          <ul className="mt-3 space-y-0.5">
            {BROWSE.map((b) => (
              <li key={b.label}><span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-ink-soft hover:bg-bg-soft"><b.icon className="h-4 w-4 text-royal-blue" /> {b.label}</span></li>
            ))}
          </ul>
          <div className="mt-6 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Popular Topics</div>
          <ul className="mt-3 space-y-1.5 text-[12.5px] text-ink-soft">{TOPICS.map((t) => <li key={t} className="hover:text-royal-blue">{t}</li>)}</ul>
          <div className="mt-6 rounded-2xl border border-line bg-bg-soft/50 p-4 text-center">
            <Download className="mx-auto h-6 w-6 text-royal-blue" />
            <div className="mt-2 text-[12.5px] font-bold text-deep-navy">Free Resource Library</div>
            <p className="mt-1 text-[11px] text-ink-soft">Access templates, checklists, and frameworks to accelerate your growth.</p>
            <Link href="/resources" className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-royal-blue">Explore Library <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </aside>

        {/* Article */}
        <article className="min-w-0">
          <MarketingBreadcrumb items={[["Resources", "/resources"], ["Guides", "/resources"], [data.eyebrow, null]]} />
          <div className="mt-4 text-[12px] font-bold uppercase tracking-wider text-royal-blue">Guide</div>
          <h1 className="mt-2 font-display text-[34px] font-extrabold leading-tight text-deep-navy lg:text-[40px]">{data.eyebrow}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{data.subtitle}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
            <div className="flex items-center gap-2 text-[12.5px] text-ink-soft"><span className="h-8 w-8 rounded-full bg-gradient-to-br from-royal-blue to-pink-brand" /> By Sarah Mitchell <span className="text-ink-muted">· May 22, 2026 · 12 min read</span></div>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <span className="text-[11px] font-semibold">Share</span>
              {[Linkedin, Twitter, Facebook, Link2].map((I, i) => <span key={i} className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-soft"><I className="h-3.5 w-3.5" /></span>)}
            </div>
          </div>

          <div className="mt-6 grid h-44 place-items-center rounded-2xl bg-gradient-to-br from-deep-navy to-deep-panel">
            <div className="text-center text-white"><div className="font-display text-2xl font-extrabold">Automate. Personalize.</div><div className="font-display text-2xl font-extrabold">Engage. Grow.</div></div>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl bg-royal-tint/50 p-4">
            <Info className="h-5 w-5 shrink-0 text-royal-blue" />
            <div><div className="text-[13px] font-bold text-deep-navy">Key Takeaway</div><p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">Success is built on strategy, data, and continuous optimization — not just technology. Start with clear goals, map your customer journey, and measure what matters.</p></div>
          </div>

          <div className="mt-8 space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={s.heading} id={`sec-${i + 1}`}>
                <h2 className="text-[19px] font-bold text-deep-navy">{i + 1}. {s.heading}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
                <ul className="mt-3 space-y-1.5">{s.bullets.map((b) => <li key={b} className="flex items-start gap-2 text-[13.5px] text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" /> {b}</li>)}</ul>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="mt-10 rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between"><span className="text-[14px] font-bold text-deep-navy">Related Resources</span><Link href="/resources" className="text-[12px] font-semibold text-royal-blue">View all guides →</Link></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {RELATED.map((r) => (
                <div key={r.title} className="rounded-xl border border-line p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-royal-blue">{r.tag}</div>
                  <div className="mt-1 text-[12.5px] font-bold text-deep-navy">{r.title}</div>
                  <div className="mt-1 text-[11px] text-ink-muted">{r.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Right TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">On This Page</div>
            <ol className="mt-3 space-y-1.5 text-[12px]">
              {TOC.map((t, i) => <li key={t}><a href={`#sec-${i + 1}`} className={`block ${i === 0 ? "font-semibold text-royal-blue" : "text-ink-soft hover:text-royal-blue"}`}>{i + 1}. {t}</a></li>)}
            </ol>
            <div className="mt-6 rounded-2xl border border-line bg-bg-soft/50 p-4 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><TrendingUp className="h-5 w-5" /></span>
              <div className="mt-2 text-[13px] font-bold text-deep-navy">Ready to automate smarter?</div>
              <p className="mt-1 text-[11.5px] text-ink-soft">Amplivanta helps you build automation that drives engagement and growth — at every stage.</p>
              <Link href="/signup" className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-royal-blue text-[12px] font-bold text-white">Start Engineering Growth</Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
