import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bookmark, Lightbulb, MoreVertical, Play, PlusCircle } from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import {
  VIDEO_CATEGORIES,
  VIDEO_CONTINUE,
  VIDEO_FEATURED,
  VIDEO_FILTERS,
  VIDEO_PROGRESS,
  VIDEOS,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Video Library",
  description: "Learn, grow, and get the most out of Amplivanta with step-by-step tutorials and walkthroughs.",
};

export default function VideosPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Videos" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">
            Video Library
          </h1>
          <p className="mt-1 max-w-lg text-[13.5px] leading-relaxed text-ink-soft">
            Learn, grow, and get the most out of Amplivanta with step-by-step tutorials, strategy
            sessions, and product walkthroughs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-violet transition hover:border-violet/40">
            <PlusCircle className="h-4 w-4" /> Suggest a Video
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-deep-navy px-4 text-[13px] font-semibold text-white transition hover:bg-deep-panel">
            <Bookmark className="h-4 w-4" /> Watch Later
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* Featured */}
          <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A1A6E] via-[#3B2494] to-[#5B2FE0] p-8 text-white shadow-card-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider">
              <Play className="h-3 w-3" /> {VIDEO_FEATURED.badge}
            </span>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div>
                <h2 className="font-display text-[28px] font-extrabold leading-snug">
                  {VIDEO_FEATURED.title}
                </h2>
                <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/75">
                  {VIDEO_FEATURED.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11.5px]">
                  {[VIDEO_FEATURED.duration, VIDEO_FEATURED.level, VIDEO_FEATURED.track].map((c) => (
                    <span key={c} className="rounded-full bg-white/12 px-3 py-1 font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-violet">
                    <Play className="h-4 w-4" /> Watch Now
                  </button>
                  <button className="inline-flex h-11 items-center rounded-xl border border-white/25 px-5 text-[13px] font-semibold text-white">
                    More Details
                  </button>
                </div>
              </div>
              <div className="relative flex items-center justify-center rounded-2xl bg-black/25">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-violet">
                  <Play className="h-6 w-6" />
                </span>
                <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold">
                  {VIDEO_FEATURED.duration}
                </span>
              </div>
            </div>
          </article>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {VIDEO_FILTERS.map((f, i) => (
              <button
                key={f}
                className={`rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition ${
                  i === 0
                    ? "border-violet/30 bg-violet/10 text-violet"
                    : "border-line bg-white text-ink-soft hover:border-violet/30 hover:text-violet"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Popular videos */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[20px] font-extrabold text-ink">Popular Videos</h2>
            <Link href="#" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View All Videos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VIDEOS.map((v) => (
              <article
                key={v.id}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${v.cover}`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-violet">
                    <Play className="h-4.5 w-4.5" />
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {v.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[13.5px] font-bold leading-snug text-ink">{v.title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">{v.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink-muted">{v.level}</span>
                    <MoreVertical className="h-4 w-4 text-ink-muted" />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-violet/30">
              Load More Videos
            </button>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard
            title="Continue Learning"
            action={<Link href="#" className="text-[12px] font-semibold text-violet">View All →</Link>}
          >
            <ul className="space-y-3">
              {VIDEO_CONTINUE.map((c) => (
                <li key={c.title}>
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-14 shrink-0 rounded-lg bg-gradient-to-br from-royal-tint to-violet/20" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold text-ink">{c.title}</div>
                      <div className="text-[11px] text-ink-muted">{c.left}</div>
                    </div>
                    <span className="text-[11px] font-bold text-violet">{c.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-violet" style={{ width: `${c.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="Your Progress">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(#6D3BF5_0%_68%,#EEE_68%_100%)]">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[15px] font-extrabold text-ink">{VIDEO_PROGRESS.percent}%</span>
                  <span className="text-[8.5px] text-ink-muted">Completed</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11.5px]">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed <b className="ml-auto">{VIDEO_PROGRESS.completed}</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet" /> In Progress <b className="ml-auto">{VIDEO_PROGRESS.inProgress}</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-line" /> Not Started <b className="ml-auto">{VIDEO_PROGRESS.notStarted}</b></li>
              </ul>
            </div>
            <button className="mt-4 w-full rounded-xl border border-line py-2 text-[12.5px] font-semibold text-violet">
              View My Learning Path
            </button>
          </RailCard>

          <RailCard title="Top Categories">
            <ul className="space-y-2.5">
              {VIDEO_CATEGORIES.map((c) => (
                <li key={c.label} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-soft">{c.label}</span>
                  <span className="font-semibold text-ink-muted">{c.count}</span>
                </li>
              ))}
            </ul>
          </RailCard>

          <section className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.08] to-royal-tint p-5">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-5 w-5 text-violet" />
              <div>
                <h2 className="text-[14px] font-bold text-ink">Have a topic in mind?</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  Tell us what you want to learn about and we&apos;ll create it.
                </p>
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2 text-[12.5px] font-semibold text-white">
              Request a Video
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
