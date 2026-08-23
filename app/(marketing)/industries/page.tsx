import Link from "next/link";
import type { Metadata } from "next";
import { INDUSTRY_PAGES } from "@/lib/marketing-modules";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Industries — Amplivanta" };

export default function IndustriesIndex() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">Industries</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">Built for how you grow.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">Templates, workflows, and compliance defaults tuned per industry.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(INDUSTRY_PAGES).map(([slug, data]) => (
            <Link key={slug} href={`/industries/${slug}`} className="group rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet">{data.eyebrow}</div>
              <h3 className="mt-3 text-[16px] font-bold text-ink">{data.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{data.subtitle}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                Read more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
