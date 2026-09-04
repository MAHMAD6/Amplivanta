import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { PlaceOrderButton } from "@/components/marketplace/purchase-ui";
import { getCheckoutQuote } from "@/app/(app)/app/marketplace/actions";

export const metadata: Metadata = { title: "Checkout" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function CheckoutPage() {
  const quote = await getCheckoutQuote();
  const blocked = quote.requiresProvider && !quote.providerConfigured;

  return (
    <>
      <MpHeader
        title="Checkout"
        description="Complete your Marketplace purchase."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Cart", href: "/app/marketplace/cart" },
          { label: "Checkout" },
        ]}
      />

      {quote.lines.length === 0 ? (
        <MpCard>
          <MpEmpty
            icon={CreditCard}
            title={quote.connected ? "Nothing to check out" : "Checkout unavailable"}
            description={
              quote.connected
                ? "Your cart is empty."
                : "The platform database could not be reached, so checkout cannot be shown right now."
            }
            action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
          />
        </MpCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <MpCard>
            <div className="border-b border-line px-6 py-4 text-[15px] font-bold text-deep-navy">Order summary</div>
            <div className="divide-y divide-line">
              {quote.lines.map((l) => (
                <div key={l.itemId} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-semibold text-deep-navy">{l.title}</div>
                    <div className="text-[12px] text-ink-muted">Licence {l.licenseVersion}</div>
                  </div>
                  <span className="text-[14px] font-bold text-deep-navy">{money(l.unitPriceCents, l.currency)}</span>
                </div>
              ))}
            </div>
          </MpCard>

          <MpCard className="h-fit p-6">
            <div className="flex items-center justify-between text-[13px] text-ink-soft">
              <span>Subtotal</span>
              <span className="font-semibold text-deep-navy">{money(quote.subtotalCents, quote.currency)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px] text-ink-soft">
              <span>Tax</span>
              <span className="text-ink-muted">Not configured</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-[14px] font-bold text-deep-navy">Total</span>
              <span className="text-[20px] font-extrabold text-deep-navy">{money(quote.totalCents, quote.currency)}</span>
            </div>
            <div className="mt-5">
              <PlaceOrderButton
                totalCents={quote.totalCents}
                currency={quote.currency}
                blocked={blocked}
                blockedReason={
                  blocked
                    ? "No payment provider is connected, so a paid order cannot be taken. Free products can still be claimed."
                    : null
                }
              />
            </div>
          </MpCard>
        </div>
      )}

      <MpNote title="How this order is priced">
        Prices and totals are calculated server-side from the published product version, never from
        the browser. Tax treatment and the payment provider are launch decisions still to be confirmed.
      </MpNote>
    </>
  );
}
