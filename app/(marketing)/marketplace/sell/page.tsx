import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { IconTile, StoreHead } from "@/components/marketing/storefront";

export const metadata: Metadata = {
  title: "Sell on Amplivanta",
  description:
    "Apply to become a Marketplace seller, publish eligible digital products, and manage listings through your Amplivanta account.",
};

const APPLY = "/app/marketplace/sell";

const STEPS = [
  ["Apply", "Tell us about your store and the products you plan to offer."],
  ["Review", "Marketplace eligibility and submitted information are reviewed."],
  ["Set up", "Approved sellers complete any required store, payout, and policy setup."],
  ["List products", "Create listings and submit products for applicable review before publication."],
];

export default function SellOnAmplivantaPage() {
  const next = encodeURIComponent(APPLY);
  const before: [string, React.ReactNode][] = [
    [
      "Seller terms",
      <>
        Review the{" "}
        <Link href="/legal/marketplace-seller-agreement" className="text-site-purple hover:underline">Seller Agreement</Link>,{" "}
        Product &amp; Content Policy, and applicable{" "}
        <Link href="/legal/marketplace-terms" className="text-site-purple hover:underline">Marketplace terms</Link>.
      </>,
    ],
    [
      "AI-created products",
      "AI-generated and AI-assisted products may be permitted when rights, disclosure, quality, and policy requirements are met.",
    ],
    [
      "Fees & payouts",
      "Current commission, payout timing, methods, thresholds, currencies, and fees are shown from production configuration.",
    ],
    [
      "Rights & licenses",
      "Sellers must have sufficient rights to every product component and provide accurate license information.",
    ],
  ];

  return (
    <>
      <StoreHead
        crumbs={["Marketplace", "Sell on Amplivanta"]}
        title="Sell digital marketing resources on Amplivanta"
        lead="Apply to become a Marketplace seller, publish eligible digital products, and manage listings through your Amplivanta account."
      />
      <div className="flex flex-wrap gap-3.5">
        <Link href={`/login?next=${next}`} className={`${btnPrimary} px-10 py-3.5`}>Sign in to Apply</Link>
        <Link href={`/signup?next=${next}`} className={`${btn} px-10 py-3.5`}>Create Account</Link>
      </div>

      <section className="mt-12">
        <h2 className="m-0 mb-4 text-[22px] font-extrabold text-site-ink">How it works</h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="rounded-2xl border border-site-line bg-white p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4F1FF] text-[11.5px] font-bold text-site-purple">
                {i + 1}
              </span>
              <h3 className="m-0 mt-4 text-[14.5px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 mt-2 text-[12.5px] leading-relaxed text-site-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl bg-[#F8F8FD] p-6 sm:p-8">
        <h2 className="m-0 mb-6 text-[18px] font-extrabold text-site-ink">Before you apply</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
          {before.map(([title, body]) => (
            <div key={title} className="flex gap-4">
              <IconTile className="h-10 w-10 bg-white">
                <CircleCheck aria-hidden className="h-5 w-5" />
              </IconTile>
              <div>
                <h3 className="m-0 text-[14px] font-extrabold text-site-ink">{title}</h3>
                <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-site-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
