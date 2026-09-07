import Link from "next/link";
import type { Metadata } from "next";
import { SOLUTION_PAGES } from "@/lib/marketing-modules";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Solutions" };

export default function SolutionsIndex() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet">Solutions</span>
          <h1 className="mt-4 font-display text-5xl font-extrabold text-ink">Pick the outcome. We&apos;ll route the tools.</h1>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Object.entries(SOLUTION_PAGES).map(([slug, data]) => (
            <Link key={slug} href={`/solutions/${slug}`} className="group rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet/30 hover:shadow-card-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet">{data.eyebrow}</div>
              <h3 className="mt-3 text-[18px] font-bold text-ink">{data.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{data.subtitle}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
