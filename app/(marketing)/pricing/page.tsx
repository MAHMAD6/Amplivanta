import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Section } from "@/components/marketing/site-ui";
import { PRICING_FAQ, PRICING_NOTES } from "@/lib/site-pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start with a free plan, move into broader marketing and automation capacity as needed, or talk with us about enterprise requirements.",
};

export default function PricingPage() {
  return (
    <>
      <section className="text-center">
        <span className="inline-flex rounded-full bg-[#F0ECFF] px-3.5 py-1.5 text-[11.5px] font-extrabold tracking-[1.4px] text-site-purple">
          PRICING
        </span>
        <h1 className="mx-auto mt-4 max-w-[900px] text-[34px] font-extrabold leading-[1.05] tracking-[-1.5px] text-site-ink sm:text-[46px] lg:text-[54px]">
          Choose the plan that fits how you{" "}
          <span className="bg-gradient-to-r from-site-blue via-site-purple to-site-orange bg-clip-text text-transparent">
            engineer growth.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-[760px] text-[16px] leading-[1.55] text-site-muted">
          Start with a free plan, move into broader marketing and automation capacity as needed, or
          talk with us about enterprise requirements.
        </p>
      </section>

      <PricingTable />

      {/* Marketplace commission, stated once so plans and seller terms cannot disagree. */}
      <section className="mt-8 grid grid-cols-1 gap-6 rounded-[18px] border border-site-line bg-white p-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <h2 className="m-0 mb-2 text-[19px] font-extrabold text-site-ink">
            Marketplace selling does not require a paid Amplivanta plan.
          </h2>
          <p className="m-0 text-[13.5px] leading-[1.55] text-site-muted">
            A seller can participate under seller-only terms at a 20% Marketplace commission. An
            eligible paid Amplivanta plan reduces the Marketplace seller commission to 15%, giving
            sellers a clear reason to subscribe without making a subscription mandatory.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["20%", "Seller-only or Free plan Marketplace commission*"],
            ["15%", "Eligible paid-plan Marketplace commission*"],
          ].map(([figure, label]) => (
            <div key={figure} className="rounded-xl border border-site-line bg-site-soft p-4">
              <div className="text-[24px] font-extrabold text-site-purple">{figure}</div>
              <div className="mt-1 text-[11.5px] leading-[1.4] text-site-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_NOTES.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-site-line bg-white p-5">
              <h3 className="m-0 mb-1.5 text-[14.5px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 text-[12.8px] leading-[1.5] text-site-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Pricing FAQ">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {PRICING_FAQ.map(([q, a]) => (
            <details
              key={q}
              className="group rounded-2xl border border-site-line bg-white px-5 py-4 open:shadow-[0_10px_28px_rgba(40,54,100,0.07)]"
            >
              <summary className="cursor-pointer list-none text-[14px] font-extrabold text-site-ink marker:hidden">
                <span className="mr-2 inline-block text-site-purple transition group-open:rotate-90">▸</span>
                {q}
              </summary>
              <p className="mt-2.5 pl-5 text-[13px] leading-[1.55] text-site-muted">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <p className="mt-6 text-center text-[12.5px] text-site-muted">
        Questions about a plan?{" "}
        <Link href="/contact" className="font-semibold text-site-purple hover:underline">
          Talk to us
        </Link>{" "}
        or{" "}
        <Link href="/book-demo" className="font-semibold text-site-purple hover:underline">
          book a demo
        </Link>
        .
      </p>
    </>
  );
}
