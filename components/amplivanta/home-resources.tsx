import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LayoutTemplate,
  LifeBuoy,
  MonitorPlay,
  PenLine,
  PlayCircle,
} from "lucide-react";
import { HOME_RESOURCES } from "@/lib/constants";

const iconMap = {
  pen: PenLine,
  book: BookOpen,
  layout: LayoutTemplate,
  monitor: MonitorPlay,
  play: PlayCircle,
  "life-buoy": LifeBuoy,
} as const;

export function HomeResources() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,_0.85fr)_minmax(0,_1.6fr)]">
          {/* featured */}
          <div>
            <h2 className="font-display text-[20px] font-extrabold text-royal-blue">
              Resources to Accelerate Growth
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  Featured Resource
                </span>
                <h3 className="mt-2 font-display text-[19px] font-extrabold leading-tight text-deep-navy">
                  The Growth Engineering Playbook
                </h3>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
                  Proven frameworks to find, prioritize, and execute high-impact growth.
                </p>
                <Link
                  href="/resources/growth-engineering-playbook"
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-royal-blue"
                >
                  Download Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div
                aria-hidden="true"
                className="flex h-[150px] w-[112px] flex-col justify-between rounded-md bg-deep-navy p-3 shadow-card"
              >
                <span className="text-[12px] font-bold leading-tight text-white">
                  The Growth Engineering Playbook
                </span>
                <span className="text-[7px] uppercase tracking-[0.18em] text-white/50">
                  Amplivanta
                </span>
              </div>
            </div>
          </div>

          {/* resource grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_RESOURCES.map((r) => {
              const Icon = iconMap[r.icon as keyof typeof iconMap];
              return (
                <Link
                  key={r.title}
                  href={r.href}
                  className="rounded-xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-royal-blue/30 hover:shadow-card"
                >
                  <Icon className="h-5 w-5 text-royal-blue" strokeWidth={1.5} />
                  <div className="mt-3 text-[13px] font-bold text-deep-navy">{r.title}</div>
                  <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">{r.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
