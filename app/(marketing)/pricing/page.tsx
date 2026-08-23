import type { Metadata } from "next";
import { PricingClient } from "@/components/amplivanta/pricing-client";
import { PRICING_FAQ } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Amplivanta",
  description: "Growth pricing. Powerful results. Everything you need to engineer growth and scale your business.",
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-royal-tint/50 to-white pb-6 pt-16">
        <div className="mx-auto max-w-[1000px] px-4 text-center lg:px-8">
          <h1 className="font-display text-[42px] font-extrabold leading-[1.05] text-deep-navy lg:text-[54px]">
            Growth pricing. <span className="text-royal-blue">Powerful results.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            Everything you need to engineer growth and scale your business.
          </p>
        </div>
      </section>

      <PricingClient />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
          <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">Pricing FAQ</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PRICING_FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-white px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[13.5px] font-semibold text-deep-navy">
                  {f.q}
                  <span className="text-royal-blue transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
