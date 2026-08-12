import Link from "next/link";
import { ArrowRight, Rocket, Users, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const STATS = [
  { icon: Rocket, num: "10K+", lbl: "Businesses Growing" },
  { icon: Users, num: "2M+", lbl: "Leads Generated" },
  { icon: TrendingUp, num: "$250M+", lbl: "Revenue Driven" },
];

export function CtaBanner() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="bg-grad-cta relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-10 overflow-hidden rounded-[1.75rem] px-8 py-12 text-white shadow-2xl sm:px-12">
          {/* left */}
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-extrabold leading-[1.15] md:text-[2rem]">
              Ready to Engineer Your Next<br className="hidden sm:block" /> Stage of Growth?
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90">
              Join thousands of businesses using Amplivanta to automate, optimize, and scale.
            </p>
            <Link
              href="/contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-bold text-[#14121f] transition-all hover:-translate-y-0.5"
            >
              Start Engineering Growth
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* right — stats */}
          <div className="flex gap-9">
            {STATS.map(({ icon: Icon, num, lbl }) => (
              <div key={lbl} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-[18px] w-[18px] text-white" />
                </div>
                <div className="font-display text-2xl font-extrabold">{num}</div>
                <div className="mt-0.5 text-xs font-semibold text-white/85">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
