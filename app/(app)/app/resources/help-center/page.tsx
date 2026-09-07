import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Flag,
  Play,
  Search,
} from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import { ResourceIcon } from "@/components/amplivanta/resource-icon";
import {
  HELP_POPULAR_ARTICLES,
  HELP_POPULAR_SEARCHES,
  HELP_QUICK_LINKS,
  HELP_SYSTEM_STATUS,
  HELP_TOPICS,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers, learn best practices, and get the support you need to make the most of Amplivanta.",
};

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Help Center" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-white p-2">
            <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-4">
                <h1 className="font-display text-[36px] font-extrabold leading-tight text-ink">
                  How can we help you?
                </h1>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
                  Find answers, learn best practices, and get the support you need to make the most of
                  Amplivanta.
                </p>
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card">
                  <Search className="h-4 w-4 text-ink-muted" />
                  <input
                    aria-label="Search help articles"
                    placeholder="Search help articles, topics, or keywords…"
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-semibold text-ink-soft">Popular searches:</span>
                  {HELP_POPULAR_SEARCHES.map((s) => (
                    <button
                      key={s}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[11.5px] font-medium text-ink-soft transition hover:border-violet/30 hover:text-violet"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center p-4">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-violet/25 to-royal-tint">
                  <div className="absolute inset-6 rounded-full bg-white shadow" />
                  <ResourceIcon name="chat" className="relative h-16 w-16 text-violet" />
                </div>
              </div>
            </div>
          </section>

          {/* Topics */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Browse Help Topics</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Topics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_TOPICS.map((t) => (
              <Link
                key={t.title}
                href="#"
                className="rounded-2xl border border-line bg-white p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${t.tone}`}>
                  <ResourceIcon name={t.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[14.5px] font-bold text-ink">{t.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{t.desc}</p>
                <div className="mt-3 text-[12px] font-semibold text-violet">{t.count} articles</div>
              </Link>
            ))}
          </div>

          {/* Popular articles */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Popular Articles</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {HELP_POPULAR_ARTICLES.map((a) => (
              <div
                key={a.title}
                className="grid grid-cols-[24px_1fr_140px_110px_90px] items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 hover:bg-bg-soft"
              >
                <FileText className="h-4 w-4 text-ink-muted" />
                <div>
                  <div className="text-[13px] font-semibold text-ink">{a.title}</div>
                  <div className="text-[11.5px] text-ink-muted">{a.desc}</div>
                </div>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${a.tone}`}>
                  {a.category}
                </span>
                <span className="text-[12px] text-ink-soft">{a.date}</span>
                <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
                  <Eye className="h-3.5 w-3.5" /> {a.views}
                </span>
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
          <RailCard title="System Status">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {HELP_SYSTEM_STATUS.state}
            </div>
            <p className="mt-2 text-[11.5px] text-ink-muted">
              Last updated: {HELP_SYSTEM_STATUS.updated}
            </p>
            <Link href="#" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View Status Page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </RailCard>

          <RailCard title="Quick Links">
            <ul className="space-y-2">
              {HELP_QUICK_LINKS.map((q) => (
                <li key={q.title}>
                  <Link
                    href="#"
                    className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-violet/30"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${q.tone}`}>
                      <ResourceIcon name={q.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink">{q.title}</span>
                      <span className="block text-[11px] text-ink-muted">{q.desc}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          <section className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.08] to-royal-tint p-5">
            <div className="flex items-start gap-2">
              <Flag className="mt-0.5 h-5 w-5 text-violet" />
              <div>
                <h2 className="text-[14px] font-bold text-ink">Getting Started Guide</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  New to Amplivanta? Follow our step-by-step guide.
                </p>
              </div>
            </div>
            <Link
              href="/app/resources/guides"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-violet-hover"
            >
              <Play className="h-3.5 w-3.5" /> Start the Guide
            </Link>
          </section>

          <RailCard title="Still need help?">
            <ul className="space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mon–Fri, 9AM–6PM EST
              </li>
              <li>support@amplivanta.com</li>
              <li>+1 (888) 123-4567</li>
            </ul>
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-deep-navy px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-deep-panel">
              Contact Support <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}
