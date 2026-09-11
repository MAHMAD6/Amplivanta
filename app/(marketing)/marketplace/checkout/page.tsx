import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { IconTile, OrderSummary, StoreHead } from "@/components/marketing/storefront";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NEXT = "/app/marketplace/checkout";

/**
 * Public checkout entry — the reference's sign-in gate.
 *
 * Checkout completes only for a signed-in buyer, because orders, entitlements
 * and downloads belong to an account. A signed-in visitor goes straight to the
 * real checkout; anyone else signs in or creates an account and is returned
 * to checkout afterwards. The cart is stored server-side against the account,
 * so it is not lost across the sign-in.
 */
export default async function CheckoutGatePage() {
  const session = await auth();
  if (session?.user) redirect(NEXT);

  const next = encodeURIComponent(NEXT);

  return (
    <>
      <StoreHead crumbs={["Marketplace", "Checkout"]} title="Checkout" lead="Sign in to complete your Marketplace purchase." />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="rounded-2xl border border-site-line bg-white p-6 sm:p-10">
          <div className="flex gap-4">
            <IconTile className="h-12 w-12">
              <CircleCheck aria-hidden className="h-5 w-5" />
            </IconTile>
            <div>
              <h2 className="m-0 text-[19px] font-extrabold text-site-ink">Your cart will be preserved</h2>
              <p className="m-0 mt-2 max-w-[700px] text-[13px] leading-relaxed text-site-muted">
                Marketplace purchases are tied to your Amplivanta account so purchased product versions, licenses,
                order history, and download entitlements can be managed correctly.
              </p>
            </div>
          </div>

          <h3 className="m-0 mt-12 text-[14.5px] font-extrabold text-site-ink">Continue with your account</h3>
          <div className="mt-4 flex flex-wrap gap-3.5">
            <Link href={`/login?next=${next}`} className={`${btnPrimary} min-w-[190px] px-10 py-3.5`}>Sign in</Link>
            <Link href={`/signup?next=${next}`} className={`${btn} min-w-[190px] px-10 py-3.5`}>Create Account</Link>
          </div>

          <div className="mt-8 rounded-xl bg-[#F8F8FD] p-6">
            <h4 className="m-0 text-[13px] font-extrabold text-site-ink">After sign-in</h4>
            <p className="m-0 mt-3 text-[12px] leading-relaxed text-site-muted">
              Available payment methods, taxes, order totals, license terms, and required acknowledgements appear from
              the live checkout configuration before you place the order.
            </p>
          </div>
        </section>

        <OrderSummary
          rows={["Items", "Subtotal", "Tax"]}
          footnote="Payment methods are shown from the live checkout configuration after sign-in."
        />
      </div>
    </>
  );
}
