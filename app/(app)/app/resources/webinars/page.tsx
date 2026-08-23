import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarPlus, Clock, Download, PlusCircle, Play, Users } from "lucide-react";
import { ResourceBreadcrumb, RailCard } from "@/components/amplivanta/resource-breadcrumb";
import {
  WEBINAR_FEATURED,
  WEBINAR_FILTERS,
  WEBINAR_RECOMMENDED,
  WEBINAR_REGISTRATIONS,
  WEBINAR_RESOURCES,
  WEBINAR_SCHEDULE,
  WEBINARS,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Webinars — Amplivanta",
  description: "Join live sessions, watch expert replays, and learn practical growth strategies.",
};

const tagTone: Record<string, string> = {
  "UPCOMING": "bg-violet/15 text-violet",
  "LIVE NOW": "bg-red-500/15 text-red-600",
  "ON-DEMAND": "bg-emerald-500/15 text-emerald-600",
  "PRODUCT DEMO": "bg-royal-blue/15 text-royal-blue",
  "STRATEGY SESSION": "bg-orange-brand/15 text-orange-brand",
  "EXPERT TALK": "bg-pink-brand/15 text-pink-brand",
};

export default function WebinarsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <ResourceBreadcrumb current="Webinars" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight text-ink">Webinars</h1>
          <p className="mt-1 max-w-lg text-[13.5px] leading-relaxed text-ink-soft">
            Join live sessions, watch expert replays, and learn practical growth strategies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-orange-cta px-5 text-[13px] font-semibold text-white">
            <CalendarPlus className="h-4 w-4" /> Register Now
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink transition hover:border-violet/40">
            <PlusCircle className="h-4 w-4" /> Suggest a Webinar
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {/* Featured */}
          <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
              <div className="relative flex min-h-[220px] flex-col justify-end bg-gradient-to-br from-[#1B1360] via-[#3B2494] to-[#E8398F] p-7 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" /> {WEBINAR_FEATURED.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase">
                    {WEBINAR_FEATURED.badge}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-[26px] font-extrabold leading-snug">
                  {WEBINAR_FEATURED.title}
                </h2>
                <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-white/75">
                  {WEBINAR_FEATURED.desc}
                </p>
              </div>
              <div className="p-7">
                <ul className="space-y-3">
                  {WEBINAR_FEATURED.speakers.map((s) => (
                    <li key={s.name} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-soft text-[11px] font-bold text-ink-soft">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <span>
                        <span className="block text-[12.5px] font-bold text-ink">{s.name}</span>
                        <span className="block text-[11px] text-ink-muted">{s.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-soft">
                  <span>{WEBINAR_FEATURED.date}</span>
                  <span>{WEBINAR_FEATURED.time}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {WEBINAR_FEATURED.duration}</span>
                  <span className="inline-flex items-center gap-1 text-orange-brand"><Users className="h-3.5 w-3.5" /> {WEBINAR_FEATURED.seatsLeft} Seats left</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {Object.entries(WEBINAR_FEATURED.countdown).map(([label, val]) => (
                    <div key={label} className="rounded-xl border border-line px-3 py-2 text-center">
                      <div className="text-[16px] font-extrabold text-ink">{val}</div>
                      <div className="text-[9px] uppercase text-ink-muted">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-orange-cta px-5 text-[13px] font-semibold text-white">
                    Register Now
                  </button>
                  <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-5 text-[13px] font-semibold text-violet">
                    <Play className="h-4 w-4" /> Watch Preview
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {WEBINAR_FILTERS.map((f, i) => (
              <button
                key={f}
                className={`rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition ${
                  i === 0
                    ? "border-violet/30 bg-violet px-4 text-white"
                    : "border-line bg-white text-ink-soft hover:border-violet/30 hover:text-violet"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEBINARS.map((w) => (
              <article
                key={w.id}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <div className={`relative h-28 bg-gradient-to-br ${w.cover}`}>
                  <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase ${tagTone[w.tag] ?? "bg-white/80 text-ink"}`}>
                    {w.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-bold leading-snug text-ink">{w.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-[11.5px] text-ink-muted">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-soft text-[9px] font-bold">
                      {w.host.split(" ").map((n) => n[0]).join("")}
                    </span>
                    {w.host}
                  </div>
                  <div className="mt-1.5 text-[11.5px] text-ink-soft">{w.when}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-muted">
                    <Clock className="h-3 w-3" /> {w.duration}
                  </div>
                  <button className="mt-3 w-full rounded-xl border border-line py-2 text-[12px] font-semibold text-violet transition hover:border-violet/30">
                    {w.action}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-violet/30">
              Load More Webinars
            </button>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard
            title="Upcoming Schedule"
            action={<Link href="#" className="text-[12px] font-semibold text-violet">View all</Link>}
          >
            <ul className="space-y-3">
              {WEBINAR_SCHEDULE.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-line">
                    <span className="text-[9px] font-bold uppercase text-ink-muted">{s.month}</span>
                    <span className="text-[16px] font-extrabold text-ink">{s.day}</span>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold leading-snug text-ink">{s.title}</div>
                    <div className="text-[11px] text-ink-muted">
                      {s.time} · <span className={s.state === "Live" ? "text-red-500" : "text-violet"}>{s.state}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="My Registrations" action={<Link href="#" className="text-[12px] font-semibold text-violet">View all</Link>}>
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(#6D3BF5_0%_33%,#F5731A_33%_66%,#0F9D77_66%_100%)]">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[15px] font-extrabold text-ink">{WEBINAR_REGISTRATIONS.total}</span>
                  <span className="text-[8.5px] text-ink-muted">Registered</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11.5px]">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet" /> Upcoming <b className="ml-auto">{WEBINAR_REGISTRATIONS.upcoming}</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-brand" /> Live <b className="ml-auto">{WEBINAR_REGISTRATIONS.live}</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> On-Demand <b className="ml-auto">{WEBINAR_REGISTRATIONS.onDemand}</b></li>
              </ul>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-ink-soft">
                <span>Learning Progress</span>
                <span className="font-semibold">{WEBINAR_REGISTRATIONS.progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                <div className="h-full rounded-full bg-violet" style={{ width: `${WEBINAR_REGISTRATIONS.progress}%` }} />
              </div>
            </div>
          </RailCard>

          <RailCard title="Recommended for You" action={<Link href="#" className="text-[12px] font-semibold text-violet">View all</Link>}>
            <ul className="space-y-3">
              {WEBINAR_RECOMMENDED.map((r) => (
                <li key={r.title} className="flex gap-3">
                  <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-royal-tint to-violet/20 text-violet">
                    <Play className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold leading-snug text-ink">{r.title}</span>
                    <span className="block text-[11px] text-ink-muted">{r.meta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="Webinar Resources">
            <ul className="space-y-2">
              {WEBINAR_RESOURCES.map((r) => (
                <li key={r.title} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-royal-blue">
                    <Download className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-ink">{r.title}</span>
                    <span className="block text-[10.5px] text-ink-muted">{r.meta}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-muted" />
                </li>
              ))}
            </ul>
          </RailCard>
        </aside>
      </div>
    </div>
  );
}
