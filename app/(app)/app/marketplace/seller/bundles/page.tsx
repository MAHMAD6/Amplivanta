import type { Metadata } from "next";
import { Package } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { BundleForm, BundleStatusButton } from "@/components/marketplace/extension-ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Bundles" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function SellerBundlesPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.bundles,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let products: { id: string; title: string; priceLabel: string }[] = [];
  let bundles: { id: string; title: string; slug: string; status: string; priceCents: number; currency: string; items: { productId: string }[] }[] = [];
  let reachable = true;
  try {
    const [rows, bundleRows] = await Promise.all([
      prisma.marketplaceProduct.findMany({
        where: { sellerId: viewer.seller!.id, status: "PUBLISHED" },
        orderBy: { title: "asc" },
        take: 100,
        select: {
          id: true,
          title: true,
          versions: { where: { status: "PUBLISHED" }, orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } },
        },
      }),
      prisma.marketplaceBundle.findMany({
        where: { sellerId: viewer.seller!.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: { select: { productId: true } } },
      }),
    ]);
    products = rows.map((r) => ({
      id: r.id,
      title: r.title,
      priceLabel: r.versions[0] ? money(r.versions[0].priceCents, r.versions[0].currency) : "no price",
    }));
    bundles = bundleRows;
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="Bundles"
        description="Sell several of your published products together at one price."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Bundles" },
        ]}
      />

      {products.length >= 2 ? (
        <MpCard className="mb-6 p-6">
          <h2 className="mb-4 text-[15px] font-bold text-deep-navy">Create a bundle</h2>
          <BundleForm products={products} />
        </MpCard>
      ) : (
        <MpCard className="mb-6">
          <MpEmpty
            icon={Package}
            title={reachable ? "Publish two products first" : "Bundles unavailable"}
            description={
              reachable
                ? "A bundle needs at least two of your published products."
                : "The platform database could not be reached, so bundles cannot be shown."
            }
          />
        </MpCard>
      )}

      {bundles.length > 0 && (
        <MpCard>
          <div className="divide-y divide-line">
            {bundles.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-deep-navy">{b.title}</div>
                  <div className="text-[12px] text-ink-muted">
                    {b.status.toLowerCase()} · {b.items.length} products · {money(b.priceCents, b.currency)} · /{b.slug}
                  </div>
                </div>
                <BundleStatusButton id={b.id} status={b.status} />
              </div>
            ))}
          </div>
        </MpCard>
      )}

      <MpNote title="How bundle pricing works">
        A published bundle prices its products so they add up to the bundle price. If a buyer removes one of
        them from the cart, the rest revert to their list prices.
      </MpNote>
    </>
  );
}
