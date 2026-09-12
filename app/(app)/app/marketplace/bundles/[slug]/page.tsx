import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { MpCard, MpDenied, MpHeader, MpNote } from "@/components/marketplace/ui";
import { AddBundleButton } from "@/components/marketplace/extension-ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Bundle" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.bundles });
  if (!gate.ok) return <MpDenied denial={gate} />;

  const { slug } = await params;
  let bundle: {
    id: string; title: string; summary: string | null; priceCents: number; currency: string;
    seller: { storeName: string; slug: string } | null;
    products: { id: string; slug: string; title: string; priceCents: number; currency: string }[];
  } | null = null;
  let reachable = true;
  try {
    const row = await prisma.marketplaceBundle.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { items: { select: { productId: true } } },
    });
    if (row) {
      const [seller, products] = await Promise.all([
        prisma.marketplaceSeller.findUnique({ where: { id: row.sellerId }, select: { storeName: true, slug: true } }),
        prisma.marketplaceProduct.findMany({
          where: { id: { in: row.items.map((i) => i.productId) }, status: "PUBLISHED" },
          select: {
            id: true, slug: true, title: true,
            versions: { where: { status: "PUBLISHED" }, orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } },
          },
        }),
      ]);
      bundle = {
        id: row.id,
        title: row.title,
        summary: row.summary,
        priceCents: row.priceCents,
        currency: row.currency,
        seller,
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          priceCents: p.versions[0]?.priceCents ?? 0,
          currency: p.versions[0]?.currency ?? row.currency,
        })),
      };
    }
  } catch {
    reachable = false;
  }
  if (reachable && !bundle) notFound();
  if (!bundle) {
    return (
      <MpCard className="px-6 py-8 text-[13.5px] text-ink-soft">
        The platform database could not be reached, so this bundle cannot be shown right now.
      </MpCard>
    );
  }

  const listTotal = bundle.products.reduce((s, p) => s + p.priceCents, 0);
  const saving = Math.max(0, listTotal - bundle.priceCents);
  const complete = bundle.products.length > 0;

  return (
    <>
      <MpHeader
        title={bundle.title}
        description={bundle.summary ?? undefined}
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          ...(bundle.seller ? [{ label: bundle.seller.storeName, href: `/app/marketplace/stores/${bundle.seller.slug}` }] : []),
          { label: "Bundle" },
        ]}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <MpCard>
          <div className="border-b border-line px-6 py-4 text-[15px] font-bold text-deep-navy">
            What&apos;s in this bundle
          </div>
          <div className="divide-y divide-line">
            {bundle.products.map((p) => (
              <Link key={p.id} href={`/app/marketplace/products/${p.slug}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-bg-soft">
                <span className="text-[14px] font-semibold text-deep-navy">{p.title}</span>
                <span className="text-[13px] text-ink-muted">{money(p.priceCents, p.currency)}</span>
              </Link>
            ))}
          </div>
        </MpCard>

        <MpCard className="h-fit p-6">
          <div className="flex items-center gap-2 text-[13px] text-ink-soft">
            <Package className="h-4 w-4 text-royal-blue" /> Bundle price
          </div>
          <div className="mt-2 text-[26px] font-extrabold text-deep-navy">{money(bundle.priceCents, bundle.currency)}</div>
          {saving > 0 && (
            <div className="mt-1 text-[12.5px] text-ink-muted">
              <span className="line-through">{money(listTotal, bundle.currency)}</span> · save {money(saving, bundle.currency)}
            </div>
          )}
          <div className="mt-5">{complete && <AddBundleButton bundleId={bundle.id} />}</div>
        </MpCard>
      </div>

      <MpNote title="How this is priced">
        Adding the bundle puts each product in your cart at its share of the bundle price. Remove one and the
        others return to their list prices.
      </MpNote>
    </>
  );
}
