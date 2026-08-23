import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Blog — Amplivanta" };

const posts = [
  { slug: "growth-loops-vs-funnels", title: "Growth loops vs funnels: which one actually compounds?", excerpt: "Funnels leak. Loops compound. Here's how to design and instrument the difference.", author: "Alex Johnson", date: "Aug 10, 2026", tag: "Strategy" },
  { slug: "ai-in-lifecycle-marketing", title: "The realistic guide to AI in lifecycle marketing (2026 edition)", excerpt: "What actually works — and where AI still gets teams into trouble.", author: "Priya Ramesh", date: "Aug 7, 2026", tag: "AI" },
  { slug: "attribution-that-holds-up", title: "Attribution that holds up in the boardroom", excerpt: "A model finance signs off on, without pretending single-touch works.", author: "Sarah Chen", date: "Aug 3, 2026", tag: "Analytics" },
  { slug: "pql-scoring-for-plg", title: "PQL scoring for PLG: 12 signals that actually predict conversion", excerpt: "The signals worth tracking — and the ones you should stop weighting.", author: "Marcus Lee", date: "Jul 28, 2026", tag: "PLG" },
  { slug: "workflow-anti-patterns", title: "8 workflow anti-patterns to avoid", excerpt: "The automations that quietly cost you more than they earn.", author: "Emily Davis", date: "Jul 22, 2026", tag: "Automation" },
  { slug: "landing-page-ab-testing", title: "Landing page A/B testing: a rigorous checklist", excerpt: "Stop shipping tests you can't read. Here's the discipline that works.", author: "Daniel Williams", date: "Jul 15, 2026", tag: "CRO" },
];

export default function BlogIndex() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">Blog</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">Playbooks for growth operators.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">Opinionated writing on marketing, growth, and the AI-native stack.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg">
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-violet/20 via-fuchsia-200/60 to-orange-brand/25" />
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet">
                {p.tag} · <span className="text-ink-muted">{p.date}</span>
              </div>
              <h3 className="mt-2 text-[16px] font-bold leading-snug text-ink">{p.title}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{p.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                Read <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
