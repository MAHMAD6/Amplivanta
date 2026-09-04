import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Purchases" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function MyPurchasesPage() {
  const viewer = await getMarketplaceViewer();

  let orders:
    | { id: string; status: string; totalCents: number; currency: string; placedAt: Date | null; items: { id: string; titleSnapshot: string }[] }[]
    | null = null;
  try {
    orders = viewer.userId
      ? await prisma.marketplaceOrder.findMany({
          where: { buyerUserId: viewer.userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true, status: true, totalCents: true, currency: true, placedAt: true,
            items: { select: { id: true, titleSnapshot: true } },
          },
        })
      : [];
  } catch {
    orders = null;
  }

  return (
    <>
      <MpHeader
        title="My Purchases"
        description="Your Marketplace purchases, licences and downloads."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "My Purchases" }]}
      />

      {orders && orders.length > 0 ? (
        <MpCard>
          <div className="divide-y divide-line">
            {orders.map((o) => (
              <Link key={o.id} href={`/app/marketplace/purchases/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-bg-soft">
                <div>
                  <div className="text-[14px] font-bold text-deep-navy">
                    {o.items.map((i) => i.titleSnapshot).join(", ") || "Order"}
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    {o.placedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(o.placedAt) : "Not placed"} · {o.status.toLowerCase().replace(/_/g, " ")}
                  </div>
                </div>
                <span className="text-[14px] font-bold text-deep-navy">{money(o.totalCents, o.currency)}</span>
              </Link>
            ))}
          </div>
        </MpCard>
      ) : (
        <MpCard>
          <MpEmpty
            icon={ShoppingBag}
            title={orders === null ? "Purchases unavailable" : "No purchases yet"}
            description={
              orders === null
                ? "The platform database could not be reached, so your purchases cannot be shown right now."
                : "Products you buy appear here with their licence and download history."
            }
            action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
          />
        </MpCard>
      )}

      <MpNote title="How downloads work">
        A paid order is not enough on its own: each download is issued against an active entitlement
        for the exact product version you purchased, and every issued link is recorded.
      </MpNote>
    </>
  );
}
