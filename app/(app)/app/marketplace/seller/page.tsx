import type { Metadata } from "next";
import { Bell, ExternalLink, LineChart, ShoppingBag } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpStat } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Seller Dashboard" };

export default async function SellerDashboardPage() {
  const viewer = await getMarketplaceViewer();
  const sellerId = viewer.seller?.id;

  let stats: { orders: number; products: number; grossCents: number } | null = null;
  try {
    if (sellerId) {
      const [orders, products, agg] = await Promise.all([
        prisma.marketplaceOrderItem.count({ where: { sellerId } }),
        prisma.marketplaceProduct.count({ where: { sellerId, status: "PUBLISHED" } }),
        prisma.marketplaceLedgerEntry.aggregate({ where: { sellerId }, _sum: { netCents: true } }),
      ]);
      stats = { orders, products, grossCents: agg._sum.netCents ?? 0 };
    }
  } catch {
    stats = null;
  }

  const money = (c?: number) =>
    stats && c !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100) : null;
  const num = (v?: number) => (stats && v !== undefined ? v.toLocaleString("en-US") : null);

  return (
    <>
      <MpHeader
        title="Seller Dashboard Overview"
        description="An overview of your Marketplace business."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Seller Dashboard" }]}
        action={<MpButton href="/app/marketplace" icon={ExternalLink}>Visit Marketplace</MpButton>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MpStat label="Total Sales" value={money(stats?.grossCents)} hint="All time" />
        <MpStat label="Total Orders" value={num(stats?.orders)} hint="All time" />
        <MpStat label="Total Earnings" value={money(stats?.grossCents)} hint="All time" />
        <MpStat label="Active Products" value={num(stats?.products)} hint="Published" />
      </div>

      <MpCard className="mt-6">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-[15px] font-bold text-deep-navy">Performance Overview</h2>
        </div>
        <MpEmpty
          icon={LineChart}
          title="No performance data yet"
          description="Once your products start selling, your performance will appear here."
        />
      </MpCard>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MpCard>
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-[15px] font-bold text-deep-navy">Recent Orders</h2>
            <MpButton href="/app/marketplace/seller/orders">View all</MpButton>
          </div>
          <MpEmpty icon={ShoppingBag} title="No orders yet" description="Orders for your products will appear here." />
        </MpCard>
        <MpCard>
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-[15px] font-bold text-deep-navy">Announcements</h2>
          </div>
          <MpEmpty icon={Bell} title="No announcements" description="Important updates will appear here." />
        </MpCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <MpButton href="/app/marketplace/seller/products">My Products</MpButton>
        <MpButton href="/app/marketplace/seller/coupons">Coupons</MpButton>
        <MpButton href="/app/marketplace/seller/bundles">Bundles</MpButton>
        <MpButton href="/app/marketplace/seller/earnings">Earnings &amp; Payouts</MpButton>
        <MpButton href="/app/marketplace/seller/settings">Profile &amp; Settings</MpButton>
      </div>

      <MpCard className="mt-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <div className="text-[15px] font-bold text-deep-navy">Ready to start selling?</div>
          <p className="mt-0.5 text-[13px] text-ink-soft">Create your first product and submit it for review.</p>
        </div>
        <MpButton href="/app/marketplace/seller/products/new" variant="primary">Add Your First Product</MpButton>
      </MpCard>
    </>
  );
}
