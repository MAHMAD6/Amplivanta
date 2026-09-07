import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { GradientText, GradientButton } from "./brand-gradient";

export interface MarketingFeature {
  title: string;
  desc: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MarketingPageProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  ctas?: { label: string; href: string; primary?: boolean }[];
  bullets?: string[];
  features?: MarketingFeature[];
  stats?: { value: string; label: string }[];
  quote?: { text: string; author: string; role: string };
  faq?: { q: string; a: string }[];
}

export function MarketingPage(p: MarketingPageProps) {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-fuchsia-50/50 to-white pb-14 pt-20">
        <div className="mx-auto max-w-[1100px] px-4 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet">
            <Sparkles className="h-3 w-3" /> {p.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-ink lg:text-6xl">
            {p.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{p.subtitle}</p>
          {p.ctas && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {p.ctas.map((c) =>
                c.primary ? (
                  <GradientButton key={c.href} as={Link} href={c.href} size="lg">
                    {c.label} <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                ) : (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink transition hover:border-ink/30"
                  >
                    {c.label}
                  </Link>
                )
              )}
            </div>
          )}
          {p.bullets && (
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-ink-soft">
              {p.bullets.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" /> {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {p.stats && (
        <section className="border-y border-line bg-white py-10">
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 px-4 sm:grid-cols-4 lg:px-8">
            {p.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-extrabold">
                  <GradientText>{s.value}</GradientText>
                </div>
                <div className="mt-1 text-[13px] text-ink-soft">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {p.features && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
            <h2 className="text-center font-display text-3xl font-extrabold text-ink">What&apos;s inside</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {p.features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet">
                      {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                    <h3 className="mt-5 text-[15px] font-bold text-ink">{f.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {p.quote && (
        <section className="bg-bg-soft py-16">
          <div className="mx-auto max-w-[880px] px-4 text-center lg:px-8">
            <blockquote className="font-display text-2xl font-semibold leading-snug text-ink lg:text-3xl">
              &ldquo;{p.quote.text}&rdquo;
            </blockquote>
            <div className="mt-6 text-[13.5px] font-semibold text-ink">
              {p.quote.author}
              <span className="ml-2 font-normal text-ink-muted">· {p.quote.role}</span>
            </div>
          </div>
        </section>
      )}

      {p.faq && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-[900px] px-4 lg:px-8">
            <h2 className="text-center font-display text-3xl font-extrabold text-ink">Common questions</h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-white">
              {p.faq.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold text-ink">
                    {f.q}
                    <span className="text-violet transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white pb-20">
        <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
          <div className="rounded-3xl bg-grad-cta p-10 text-center text-white">
            <h3 className="font-display text-2xl font-extrabold">Ready to see it live?</h3>
            <p className="mt-2 text-white/85">Start free, no credit card required.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/signup" className="inline-flex h-11 items-center rounded-xl bg-white px-6 text-sm font-bold text-ink">
                Start Free
              </Link>
              <Link href="/contact" className="inline-flex h-11 items-center rounded-xl border border-white/30 px-6 text-sm font-bold text-white">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
