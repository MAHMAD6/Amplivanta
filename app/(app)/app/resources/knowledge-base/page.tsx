import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bookmark, Headphones, Mail, PlusCircle, Search } from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import { ResourceIcon } from "@/components/amplivanta/resource-icon";
import {
  KB_CATEGORIES,
  KB_POPULAR_ARTICLES,
  KB_POPULAR_SEARCHES,
  KB_RECENT_ARTICLES,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Knowledge Base — Amplivanta",
  description: "Find answers, best practices, and step-by-step guides to get the most out of Amplivanta.",
};

export default function KnowledgeBasePage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Knowledge Base" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">
            Knowledge Base
          </h1>
          <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
            Find answers, best practices, and step-by-step guides to help you get the most out of
            Amplivanta.
          </p>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-ink transition hover:border-violet/40">
          <PlusCircle className="h-4 w-4" /> Suggest an Article
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Search hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet/[0.12] via-royal-tint to-violet/[0.06] p-8 shadow-card">
            <div className="max-w-xl">
              <h2 className="font-display text-[26px] font-extrabold text-ink">How can we help you?</h2>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-card">
                <Search className="h-4 w-4 text-ink-muted" />
                <input
                  aria-label="Search the knowledge base"
                  placeholder="Search for answers, topics, or keywords…"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-ink-soft">Popular searches:</span>
                {KB_POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    className="rounded-full border border-line bg-white px-3 py-1 text-[11.5px] font-medium text-ink-soft transition hover:border-violet/30 hover:text-violet"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Browse by category */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Browse by Category</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KB_CATEGORIES.map((c) => (
              <Link
                key={c.title}
                href="#"
                className="rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
                  <ResourceIcon name={c.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-ink">{c.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{c.desc}</p>
                <div className="mt-3 text-[12px] font-semibold text-violet">{c.count} articles</div>
              </Link>
            ))}
          </div>

          {/* Recent articles */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Recent Articles</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-[1fr_150px_120px_40px] gap-3 border-b border-line bg-bg-soft px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              <span>Article</span>
              <span>Category</span>
              <span>Last Updated</span>
              <span />
            </div>
            {KB_RECENT_ARTICLES.map((a) => (
              <div
                key={a.title}
                className="grid grid-cols-[1fr_150px_120px_40px] items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 hover:bg-bg-soft"
              >
                <div>
                  <div className="text-[13px] font-semibold text-ink">{a.title}</div>
                  <div className="text-[11.5px] text-ink-muted">{a.desc}</div>
                </div>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${a.tone}`}>
                  {a.category}
                </span>
                <span className="text-[12px] text-ink-soft">{a.updated}</span>
                <Bookmark className="h-4 w-4 text-ink-muted" />
              </div>
            ))}
            <div className="flex justify-center py-4">
              <button className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-violet/30">
                Load More Articles
              </button>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard
            title="Popular Articles"
            action={<Link href="#" className="text-[12px] font-semibold text-violet">View All →</Link>}
          >
            <ul className="space-y-4">
              {KB_POPULAR_ARTICLES.map((a) => (
                <li key={a.rank} className="flex gap-3">
                  <span className="text-[12px] font-bold text-ink-muted">{a.rank}</span>
                  <span>
                    <span className="block text-[12.5px] font-bold leading-snug text-ink">{a.title}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{a.updated}</span>
                  </span>
                </li>
              ))}
            </ul>
          </RailCard>

          <section className="rounded-2xl border border-royal-blue/20 bg-royal-tint p-5">
            <div className="flex items-start gap-3">
              <Headphones className="mt-0.5 h-5 w-5 text-royal-blue" />
              <div>
                <h2 className="text-[14px] font-bold text-ink">Still need help?</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                </p>
              </div>
            </div>
            <Link
              href="/app/resources/help-center"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-royal-blue/30 bg-white px-4 py-2 text-[12.5px] font-semibold text-royal-blue"
            >
              Visit Help Center <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <RailCard title="Contribute to the Knowledge Base">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Share your expertise and help others succeed by contributing an article.
            </p>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-violet">
              Submit an Article <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </RailCard>

          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <h2 className="text-[14px] font-bold text-ink">Stay Updated</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Get the latest tips, guides, and product updates delivered to your inbox.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white"
              >
                <Mail className="h-3.5 w-3.5" /> Subscribe
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
