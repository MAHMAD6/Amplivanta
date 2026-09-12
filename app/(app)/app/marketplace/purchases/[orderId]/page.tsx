import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, LifeBuoy, ScrollText, Store } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { DownloadButton } from "@/components/marketplace/purchase-ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { STANDARD_LICENSE } from "@/lib/marketplace/storefront";

export const metadata: Metadata = { title: "Purchase Detail" };

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

const TYPE_LABEL: Record<string, string> = {
  TEMPLATE: "Template", DOCUMENT: "Playbook / document", TOOL_KIT: "Tool or kit",
  GRAPHIC: "Graphic", IMAGE: "Image", VIDEO: "Video",
};

export default async function PurchaseDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const viewer = await getMarketplaceViewer();
  const { orderId } = await params;

  async function load() {
    // Ownership check before any order data is read.
    return prisma.marketplaceOrder.findFirst({
      where: { id: orderId, buyerUserId: viewer.userId ?? "__none__" },
      select: {
        id: true,
        status: true,
        placedAt: true,
        totalCents: true,
        discountCents: true,
        couponCode: true,
        currency: true,
        paymentProvider: true,
        items: {
          select: {
            id: true,
            titleSnapshot: true,
            licenseVersion: true,
            unitPriceCents: true,
            quantity: true,
            currency: true,
            entitlements: { select: { id: true, status: true } },
            product: { select: { slug: true, type: true, seller: { select: { storeName: true, slug: true } } } },
          },
        },
      },
    });
  }

  let order: Awaited<ReturnType<typeof load>> = null;
  let reachable = true;
  try {
    order = await load();
  } catch {
    reachable = false;
  }
  if (reachable && !order) notFound();

  if (!order) {
    return (
      <>
        <MpHeader title="Purchase Detail" breadcrumb={[{ label: "My Purchases", href: "/app/marketplace/purchases" }]} />
        <MpCard>
          <MpEmpty
            icon={FileDown}
            title="Purchase unavailable"
            description="The platform database could not be reached, so this purchase cannot be shown right now."
          />
        </MpCard>
      </>
    );
  }

  const seller = order.items[0]?.product.seller ?? null;
  const licenseName = (v: string) => (v === STANDARD_LICENSE ? "Standard Marketplace License" : v);
  const summary: [string, string][] = [
    ["Order Status", order.status.toLowerCase().replace(/_/g, " ")],
    ["Order Date", order.placedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(order.placedAt) : "Not recorded"],
    ["Order ID", order.id],
    ["Payment Method", order.paymentProvider ?? (order.totalCents === 0 ? "No payment required" : "Not recorded")],
    ...(order.discountCents > 0
      ? ([["Discount", `-${money(order.discountCents, order.currency)}${order.couponCode ? ` (${order.couponCode})` : ""}`]] as [string, string][])
      : []),
    ["Total Paid", money(order.totalCents, order.currency)],
  ];

  return (
    <>
      <MpHeader
        title="Purchase Detail / Download & License"
        description="Review order information, license terms, and available files."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "My Purchases", href: "/app/marketplace/purchases" },
          { label: "Order" },
        ]}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <MpCard className="h-fit p-6">
          <div className="text-[14px] font-bold text-deep-navy">Order Summary</div>
          <dl className="mt-4 space-y-3">
            {summary.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3 text-[12.5px]">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="m-0 break-all text-right font-semibold capitalize text-deep-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </MpCard>

        <MpCard>
          <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-deep-navy">Purchased items</div>
          <div className="divide-y divide-line">
            {order.items.map((i) => {
              const active = i.entitlements.find((e) => e.status === "ACTIVE");
              return (
                <div key={i.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                  <div>
                    <Link href={`/app/marketplace/products/${i.product.slug}`} className="text-[14px] font-bold text-deep-navy hover:text-royal-blue">
                      {i.titleSnapshot}
                    </Link>
                    <div className="mt-1 text-[12px] text-ink-muted">
                      {TYPE_LABEL[i.product.type] ?? i.product.type} · {licenseName(i.licenseVersion)}
                      {i.entitlements[0] ? ` · entitlement ${i.entitlements[0].status.toLowerCase()}` : ""}
                    </div>
                  </div>
                  {active ? (
                    <DownloadButton entitlementId={active.id} label="Download Available Files" />
                  ) : (
                    <div className="text-right">
                      <MpButton disabled title="Shown only when entitlement is active.">Download Available Files</MpButton>
                      <p className="mt-1 text-[11px] text-ink-muted">Shown only when entitlement is active.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </MpCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MpCard className="p-6">
          <div className="flex items-center gap-2 text-[14px] font-bold text-deep-navy">
            <ScrollText className="h-4 w-4 text-royal-blue" /> License
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            The applicable license is the version associated with the purchased order item. Material rights and
            restrictions are visible in the license itself.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
            <li>• Use rights follow the license recorded on your order.</li>
            <li>• Original source files may not be redistributed unless the license permits it.</li>
          </ul>
          <div className="mt-4">
            <MpButton href="/legal/marketplace-license">View Full License</MpButton>
          </div>
        </MpCard>

        <MpCard className="p-6">
          <div className="flex items-center gap-2 text-[14px] font-bold text-deep-navy">
            <Store className="h-4 w-4 text-royal-blue" /> Seller
          </div>
          <p className="mt-3 text-[13px] font-semibold text-deep-navy">{seller?.storeName ?? "Seller"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {seller && <MpButton href={`/app/marketplace/stores/${seller.slug}`}>View Store</MpButton>}
            <MpButton href="/contact">Contact Seller</MpButton>
          </div>
        </MpCard>

        <MpCard className="p-6">
          <div className="flex items-center gap-2 text-[14px] font-bold text-deep-navy">
            <LifeBuoy className="h-4 w-4 text-royal-blue" /> Need Help?
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            Use the Marketplace support flow for questions about an order, download, refund, dispute, or seller
            communication.
          </p>
          <div className="mt-4">
            <MpButton href="/resources/help-center">Go to Help Center</MpButton>
          </div>
        </MpCard>
      </div>

      <MpCard className="mt-6">
        <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-deep-navy">Items in this Order</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-6 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-3 text-[13px] font-semibold text-deep-navy">{i.titleSnapshot}</td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-soft">{TYPE_LABEL[i.product.type] ?? i.product.type}</td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-soft">{licenseName(i.licenseVersion)}</td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-soft">{i.quantity}</td>
                  <td className="px-4 py-3 text-[12.5px] font-semibold text-deep-navy">{money(i.unitPriceCents, i.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MpCard>

      <MpNote title="Signed downloads">
        Download links are short-lived signed URLs issued per request and recorded against your entitlement. Link
        lifetime and the file-storage provider are operator settings.
      </MpNote>
    </>
  );
}
