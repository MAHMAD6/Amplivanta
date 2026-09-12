import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders and Sales" };

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

/** Buyer-facing order states grouped the way the seller view filters them. */
const TABS: [string, string, string[]][] = [
  ["all", "All Orders", []],
  ["completed", "Completed", ["PAID", "ACCESS_READY"]],
  ["pending", "Pending", ["INITIATED", "PAYMENT_PENDING"]],
  ["refunded", "Refunded", ["REFUND_PENDING", "REFUNDED", "PARTIALLY_REFUNDED"]],
  ["canceled", "Canceled", ["PAYMENT_FAILED", "CHARGEBACK_OPEN"]],
];

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.orders.read_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  const { tab = "all", q = "" } = await searchParams;
  const statuses = TABS.find(([k]) => k === tab)?.[2] ?? [];

  // Seller-ownership scoping is mandatory: only this seller's order items.
  let items:
    | {
        id: string;
        titleSnapshot: string;
        totalCents: number;
        currency: string;
        createdAt: Date;
        order: { id: string; status: string; placedAt: Date | null };
      }[]
    | null = null;
  try {
    items = await prisma.marketplaceOrderItem.findMany({
      where: {
        sellerId: viewer.seller!.id,
        ...(statuses.length ? { order: { status: { in: statuses as never } } } : {}),
        ...(q ? { titleSnapshot: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, titleSnapshot: true, totalCents: true, currency: true, createdAt: true,
        order: { select: { id: true, status: true, placedAt: true } },
      },
    });
  } catch {
    items = null;
  }

  const date = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : "—");

  return (
    <>
      <MpHeader
        title="Orders & Sales"
        description="Orders placed for your Marketplace products."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Orders & Sales" },
        ]}
      />

      <nav aria-label="Order status" className="mb-5 flex flex-wrap gap-6 border-b border-line text-[13.5px] font-semibold">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? "/app/marketplace/seller/orders" : `/app/marketplace/seller/orders?tab=${key}`}
            className={cn("pb-3", key === tab ? "-mb-px border-b-2 border-royal-blue text-royal-blue" : "text-ink-muted hover:text-deep-navy")}
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mb-4 flex flex-wrap gap-2">
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <label className="min-w-[240px] flex-1">
          <span className="sr-only">Search orders by product</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by product…"
            className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] focus:border-royal-blue focus:outline-none"
          />
        </label>
        <button type="submit" className="h-10 rounded-xl border border-line bg-white px-4 text-[12.5px] font-bold text-deep-navy hover:bg-bg-soft">
          Apply
        </button>
      </form>

      {items && items.length > 0 ? (
        <MpCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-3 font-mono text-[11.5px] text-ink-muted">{i.order.id.slice(-10)}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-deep-navy">{i.titleSnapshot}</td>
                    <td className="px-4 py-3 text-[12.5px] text-ink-soft">{date(i.order.placedAt ?? i.createdAt)}</td>
                    <td className="px-4 py-3 text-[12.5px] capitalize text-ink-soft">
                      {i.order.status.toLowerCase().replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-[12.5px] font-bold text-deep-navy">{money(i.totalCents, i.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MpCard>
      ) : (
        <MpCard>
          <MpEmpty
            icon={ShoppingBag}
            title={items === null ? "Orders unavailable" : q || statuses.length ? "No matching orders" : "No orders yet"}
            description={
              items === null
                ? "The platform database could not be reached, so your orders cannot be shown right now."
                : q || statuses.length
                  ? "No orders match this view."
                  : "Orders for your products appear here after a buyer completes a purchase."
            }
          />
        </MpCard>
      )}

      <MpNote title="Buyer information">
        Sellers see the product, order reference, date, status and amount. Buyer identity and contact details
        stay with Amplivanta and are not exposed here.
      </MpNote>
    </>
  );
}
