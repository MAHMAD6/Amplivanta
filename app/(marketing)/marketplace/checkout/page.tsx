import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Crumb, EmptyState, InfoCard, Panel, Split } from "@/components/marketing/site-ui";

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
 * real checkout; anyone else is asked to sign in or create an account and is
 * returned to checkout afterwards. The cart is stored server-side against the
 * account, so it is not lost across the sign-in.
 */
export default async function CheckoutGatePage() {
  const session = await auth();
  if (session?.user) redirect(NEXT);

  const next = encodeURIComponent(NEXT);

  return (
    <>
      <Crumb items={["Home", "Marketplace", "Checkout"]} />

      <div className="mx-auto max-w-[760px]">
        <EmptyState
          icon="→"
          title="Sign in to complete checkout"
          actions={
            <>
              <Link className={btnPrimary} href={`/login?next=${next}`}>Sign in to continue</Link>
              <Link className={btn} href={`/signup?next=${next}`}>Create an account</Link>
            </>
          }
        >
          Marketplace purchases are tied to an Amplivanta account, so your order, licence and
          downloads are available whenever you sign in. You will come straight back to checkout
          afterwards.
        </EmptyState>
      </div>

      <Panel>
        <Split>
          <InfoCard title="What happens at checkout">
            <ul>
              <li>Prices and totals are confirmed on the server when you place the order.</li>
              <li>Access is issued only after the payment provider confirms the payment.</li>
              <li>Your order records the exact product and licence version you bought.</li>
            </ul>
          </InfoCard>
          <InfoCard title="Still browsing?">
            <Link href="/marketplace/products" className="font-semibold text-site-purple hover:underline">
              Return to the catalogue
            </Link>{" "}
            or read the{" "}
            <Link href="/legal/marketplace-terms" className="font-semibold text-site-purple hover:underline">
              Marketplace terms
            </Link>{" "}
            before you buy.
          </InfoCard>
        </Split>
      </Panel>
    </>
  );
}
