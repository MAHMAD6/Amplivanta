import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { auth } from "@/lib/auth";
import { btnPrimary } from "@/components/marketing/site-buttons";
import { IconTile, OrderSummary, StoreHead } from "@/components/marketing/storefront";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Public cart. Carts are stored against an account, so a signed-in buyer is
 * sent to their real cart; a signed-out visitor has nothing saved yet.
 */
export default async function PublicCartPage() {
  const session = await auth();
  if (session?.user) redirect("/app/marketplace/cart");

  return (
    <>
      <StoreHead crumbs={["Marketplace", "Cart"]} title="Your Cart" lead="Review items before continuing to checkout." />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-site-line bg-white p-6 sm:p-8">
          <h2 className="m-0 border-b border-site-line pb-4 text-[15px] font-extrabold text-site-ink">Items</h2>
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <IconTile className="h-[72px] w-[72px] rounded-2xl">
              <ShoppingCart aria-hidden className="h-6 w-6" />
            </IconTile>
            <h3 className="m-0 mt-5 text-[20px] font-extrabold text-site-ink">Your cart is empty</h3>
            <p className="m-0 mt-1.5 text-[13.5px] text-site-muted">Add products from the Marketplace to continue.</p>
            <Link href="/marketplace/products" className={`${btnPrimary} mt-7 px-12 py-3 text-[13px]`}>
              Browse Products
            </Link>
          </div>
        </section>

        <OrderSummary
          rows={["Subtotal", "Discount", "Tax"]}
          action={
            <Link
              href="/marketplace/checkout"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-site-blue to-site-purple-2 text-[14px] font-bold text-white transition hover:brightness-110"
            >
              Continue to Checkout
            </Link>
          }
          footnote="Checkout availability, taxes, payment methods, and account requirements are determined by current Marketplace configuration."
        />
      </div>
    </>
  );
}
