import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Lock,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export interface SolutionStep {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind background class for the step medallion. */
  tone: string;
}

export interface SolutionCard {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SolutionPageProps {
  /** Slug-level label used in the breadcrumb and eyebrow. */
  name: string;
  headline: React.ReactNode;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Three short value pills directly under the hero. */
  pills: SolutionCard[];
  /** "From Growth Intelligence to X" — the chain title suffix and its steps. */
  chainTitle: string;
  chainSubtitle: string;
  chain: SolutionStep[];
  featuresTitle: string;
  features: SolutionCard[];
  howItWorks: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[];
  teams: SolutionCard[];
  outcomesTitle: string;
  outcomesBlurb?: string;
  outcomes: SolutionCard[];
  ctaTitle: string;
  ctaBlurb: string;
  /** Right-hand hero panel — a product preview rendered by the caller. */
  preview: React.ReactNode;
}

const TRUST = [
  { icon: Users, title: "Trusted by Growth Teams", desc: "Designed for teams that drive growth." },
  { icon: Sparkles, title: "AI-Powered Platform", desc: "Smarter insights, better decisions." },
  { icon: Lock, title: "Connected & Secure", desc: "Your data stays protected and private." },
  { icon: BarChart3, title: "Measurable Outcomes", desc: "Focus on what moves the needle." },
  { icon: Target, title: "Continuous Innovation", desc: "Always improving for your success." },
];

export function SolutionPage(p: SolutionPageProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-line/70 bg-white">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 py-3.5 text-[12.5px] text-ink-muted lg:px-8"
        >
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/solutions" className="hover:text-ink">Solutions</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-royal-blue">{p.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-white pb-14 pt-10">
        <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
          <div>
            <span className="inline-flex rounded-md bg-royal-tint px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-royal-blue">
              Solution
            </span>
            <div className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-royal-blue">
              {p.name}
            </div>
            <h1 className="mt-3 font-display text-[44px] font-extrabold leading-[1.08] tracking-tight text-deep-navy lg:text-[52px]">
              {p.headline}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">{p.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={p.primaryCta?.href ?? "/signup"}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange-cta px-6 text-[14px] font-semibold text-white transition hover:bg-orange-cta-hover"
              >
                {p.primaryCta?.label ?? "Start Engineering Growth"} <ArrowRight className="h-4 w-4" />
              </Link>
              {p.secondaryCta && (
                <Link
                  href={p.secondaryCta.href}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-6 text-[14px] font-semibold text-deep-navy transition hover:border-deep-navy/30"
                >
                  <Play className="h-4 w-4" /> {p.secondaryCta.label}
                </Link>
              )}
            </div>

            <div className="mt-10 grid gap-7 sm:grid-cols-3">
              {p.pills.map((v) => (
                <div key={v.title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-tint text-royal-blue">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{v.title}</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pt-6">{p.preview}</div>
        </div>
      </section>

      {/* From Growth Intelligence to X */}
      <section className="bg-bg-soft py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-royal-blue">
              Connected for Growth
            </div>
            <h2 className="mt-3 font-display text-[30px] font-extrabold text-deep-navy lg:text-[34px]">
              From Growth Intelligence to {p.chainTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
              {p.chainSubtitle}
            </p>
          </div>

          <ol className="mt-12 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
            {p.chain.map((s, i) => (
              <li key={s.title} className="relative text-center">
                {i < p.chain.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[calc(50%+40px)] right-[calc(-50%+40px)] top-8 hidden border-t border-dashed border-ink-muted/40 lg:block"
                  />
                )}
                <span
                  className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white ${s.tone}`}
                >
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-bg-soft bg-white text-[11px] font-bold text-deep-navy">
                    {i + 1}
                  </span>
                </span>
                <div className="mt-4 text-[13.5px] font-bold leading-tight text-deep-navy">{s.title}</div>
                <p className="mx-auto mt-2 max-w-[190px] text-[12px] leading-relaxed text-ink-soft">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Everything you need */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <h2 className="text-center font-display text-[28px] font-extrabold text-deep-navy lg:text-[32px]">
            {p.featuresTitle}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {p.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-white p-5 transition hover:border-royal-blue/30 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-tint text-royal-blue">
                  <f.icon className="h-5 w-5" />
                </span>
                <div className="mt-4 text-[14px] font-bold leading-tight text-deep-navy">{f.title}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Built for modern growth teams */}
      <section className="bg-bg-soft py-16">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 lg:grid-cols-2 lg:px-8">
          <div className="rounded-3xl border border-line bg-white p-7">
            <h3 className="text-center font-display text-[22px] font-extrabold text-deep-navy">
              How It Works
            </h3>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {p.howItWorks.map((h, i) => (
                <div key={h.title} className="relative text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-royal-blue text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-royal-blue">
                      <h.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 text-[13px] font-bold text-deep-navy">{h.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-7">
            <h3 className="text-center font-display text-[22px] font-extrabold text-deep-navy">
              Built for Modern Growth Teams
            </h3>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {p.teams.map((t) => (
                <div key={t.title} className="text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-royal-tint text-royal-blue">
                    <t.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="mt-3 text-[12.5px] font-bold text-deep-navy">{t.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="rounded-3xl border border-line bg-white p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
              <div>
                <h2 className="font-display text-[26px] font-extrabold leading-tight text-deep-navy">
                  {p.outcomesTitle}
                </h2>
                {p.outcomesBlurb && (
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{p.outcomesBlurb}</p>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {p.outcomes.map((o) => (
                  <div key={o.title} className="flex gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue">
                      <o.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[13.5px] font-bold text-deep-navy">{o.title}</div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{o.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA band */}
      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-deep-navy p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_120%_at_85%_10%,rgba(61,125,234,0.35),transparent_60%)]"
            />
            <div className="relative flex flex-wrap items-center gap-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                <Rocket className="h-6 w-6" />
              </span>
              <div className="min-w-[260px] flex-1">
                <h2 className="font-display text-[26px] font-extrabold leading-tight text-white">
                  {p.ctaTitle}
                </h2>
                <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-white/70">{p.ctaBlurb}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange-cta px-6 text-[14px] font-semibold text-white transition hover:bg-orange-cta-hover"
                >
                  Start Engineering Growth <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex h-12 items-center rounded-xl border border-white/25 px-6 text-[14px] font-semibold text-white transition hover:bg-white/10"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-line bg-white py-8">
        <ul className="mx-auto grid max-w-[1280px] gap-6 px-4 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
          {TRUST.map((t, i) => (
            <li
              key={t.title}
              className={`flex items-start gap-3 px-2 ${i !== 0 ? "lg:border-l lg:border-line" : ""}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-royal-blue">
                <t.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[12.5px] font-bold text-deep-navy">{t.title}</span>
                <span className="block text-[11.5px] leading-relaxed text-ink-soft">{t.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Small shared building block for the hero preview panels. */
export function PreviewPanel({
  title,
  badge = "Sample data",
  action,
  children,
}: {
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card-lg">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-deep-navy">{title}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-royal-tint px-2 py-0.5 text-[10.5px] font-semibold text-royal-blue">
            <ShieldCheck className="h-3 w-3" /> {badge}
          </span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
