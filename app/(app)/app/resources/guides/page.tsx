import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import { ResourceIcon } from "@/components/amplivanta/resource-icon";
import { GUIDE_TRACKS, GUIDES } from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step guides that take you from setup to shipping growth results.",
};

const levelTone: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-700",
  Intermediate: "bg-royal-blue/10 text-royal-blue",
  Advanced: "bg-violet/10 text-violet",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Guides" />

      <div className="mb-6">
        <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">Guides</h1>
        <p className="mt-1 max-w-lg text-[13.5px] leading-relaxed text-ink-soft">
          Follow curated, step-by-step tracks that take you from first login to shipping measurable
          growth.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {/* Tracks */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GUIDE_TRACKS.map((t) => (
              <article key={t.title} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.tone}`}>
                  <ResourceIcon name={t.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-[16px] font-bold text-ink">{t.title}</h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{t.desc}</p>
                <div className="mt-4 flex items-center justify-between text-[11.5px] text-ink-muted">
                  <span>{t.steps} steps</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {t.minutes} min
                  </span>
                </div>
                <button className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-violet">
                  Start Track <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </article>
            ))}
          </div>

          {/* All guides */}
          <h2 className="mt-8 font-display text-[20px] font-extrabold text-ink">All Guides</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            {GUIDES.map((g) => (
              <div
                key={g.title}
                className="grid grid-cols-[1fr_180px_110px_90px] min-w-[640px] items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 hover:bg-bg-soft"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[13px] font-semibold text-ink">{g.title}</span>
                </div>
                <span className="text-[12px] text-ink-soft">{g.track}</span>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${levelTone[g.level]}`}>
                  {g.level}
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
                  <Clock className="h-3.5 w-3.5" /> {g.minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rail */}
        <aside className="space-y-4">
          <RailCard title="Your Progress">
            <p className="text-[12.5px] text-ink-soft">
              Complete tracks to unlock advanced playbooks and earn workspace badges.
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-ink-soft">
                <span>Onboarding track</span>
                <span className="font-semibold">3 / 6</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                <div className="h-full w-1/2 rounded-full bg-violet" />
              </div>
            </div>
          </RailCard>

          <section className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.08] to-royal-tint p-5">
            <h2 className="text-[14px] font-bold text-ink">Prefer to watch?</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Every guide has a matching video walkthrough in the Video Library.
            </p>
            <Link
              href="/app/resources/videos"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2 text-[12.5px] font-semibold text-white"
            >
              Open Video Library <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
