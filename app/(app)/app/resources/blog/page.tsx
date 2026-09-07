import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Mail,
  Megaphone,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import {
  BLOG_FEATURED,
  BLOG_POSTS,
  BLOG_TOPICS,
  BLOG_TOP_READS,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, strategies, and best practices to help you grow, engage, and scale smarter.",
};

const topicIcons = [Sparkles, Zap, TrendingUp, Share2, BarChart3, Megaphone, Mail];

export default function ResourcesBlogPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Blog" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">
            Amplivanta Blog
          </h1>
          <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
            Insights, strategies, and best practices to help you grow, engage, and scale smarter.
          </p>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-semibold text-ink transition hover:border-violet/40">
          <Mail className="h-4 w-4" /> Subscribe
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Featured */}
          <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A1A6E] via-[#3B2494] to-[#5B2FE0] p-8 text-white shadow-card-lg lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_20%,rgba(255,255,255,0.16),transparent_60%)]"
            />
            <div className="relative max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> {BLOG_FEATURED.badge}
              </span>
              <h2 className="mt-5 font-display text-[32px] font-extrabold leading-[1.15]">
                {BLOG_FEATURED.title}
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">
                {BLOG_FEATURED.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[12px] font-bold">
                  JC
                </span>
                <div className="text-[12px]">
                  <div className="font-semibold">{BLOG_FEATURED.author}</div>
                  <div className="text-white/60">
                    {BLOG_FEATURED.date} · {BLOG_FEATURED.readTime}
                  </div>
                </div>
              </div>
              <Link
                href="#"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-violet transition hover:bg-white/90"
              >
                Read Article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          {/* Topic filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {BLOG_TOPICS.map((t, i) => {
              const Icon = topicIcons[i % topicIcons.length];
              return (
                <button
                  key={t.label}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition ${
                    i === 0
                      ? "border-violet/30 bg-violet/10 text-violet"
                      : "border-line bg-white text-ink-soft hover:border-violet/30 hover:text-violet"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Latest posts */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Latest Posts</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Posts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <div className={`h-36 bg-gradient-to-br ${p.cover}`} />
                <div className="p-4">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${p.categoryTone}`}>
                    {p.category}
                  </span>
                  <h3 className="mt-2.5 text-[15px] font-bold leading-snug text-ink">{p.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{p.excerpt}</p>
                  <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-soft text-[10px] font-bold text-ink-soft">
                      {p.author.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div className="text-[11px] text-ink-muted">
                      <span className="font-semibold text-ink-soft">{p.author}</span>
                      <br />
                      {p.date} · {p.readTime}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard
            title="Popular Topics"
            action={<Link href="#" className="text-[12px] font-semibold text-violet">View All</Link>}
          >
            <ul className="space-y-3">
              {BLOG_TOPICS.filter((t) => t.count > 0).map((t, i) => {
                const Icon = topicIcons[(i + 1) % topicIcons.length];
                return (
                  <li key={t.label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
                      <Icon className="h-4 w-4 text-violet" /> {t.label}
                    </span>
                    <span className="text-[12px] font-semibold text-ink-muted">{t.count}</span>
                  </li>
                );
              })}
            </ul>
          </RailCard>

          <RailCard title="Top Reads">
            <ul className="space-y-4">
              {BLOG_TOP_READS.map((r) => (
                <li key={r.rank} className="flex gap-3">
                  <span className="text-[12px] font-bold text-ink-muted">{r.rank}</span>
                  <span className="h-12 w-14 shrink-0 rounded-lg bg-gradient-to-br from-royal-tint to-violet/20" />
                  <span>
                    <span className="block text-[12.5px] font-bold leading-snug text-ink">{r.title}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{r.readTime}</span>
                  </span>
                </li>
              ))}
            </ul>
          </RailCard>

          <section className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.07] to-royal-tint p-5">
            <h2 className="font-display text-[16px] font-extrabold text-ink">Stay Ahead of the Curve</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Get the latest marketing insights and tips delivered to your inbox.
            </p>
            <form className="mt-4 space-y-2">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-violet/30"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-hover"
              >
                <Mail className="h-4 w-4" /> Subscribe
              </button>
            </form>
          </section>

          <RailCard>
            <div className="flex items-start gap-3">
              <Bookmark className="mt-0.5 h-4 w-4 text-violet" />
              <p className="text-[12px] leading-relaxed text-ink-soft">
                Bookmark articles to build a reading list your whole team can share.
              </p>
            </div>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}
