import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Seller Store" };

function ProductGrid({ products }: { products: { id: string; slug: string; title: string; summary: string | null; versions: { priceCents: number; currency: string }[] }[] }) {
  const money = (c: number, cur: string) =>
    c === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/app/marketplace/products/${p.slug}`}
          className="rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-royal-blue/50"
        >
          <div className="text-[15px] font-bold text-deep-navy">{p.title}</div>
          {p.summary && <p className="mt-2 line-clamp-2 text-[13px] text-ink-soft">{p.summary}</p>}
          <div className="mt-4 text-[14px] font-extrabold text-royal-blue">
            {p.versions[0] ? money(p.versions[0].priceCents, p.versions[0].currency) : "—"}
          </div>
        </Link>
      ))}
    </div>
  );
}


export default async function SellerStorePage({
  params,
}: {
  params: Promise<{ sellerSlug: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  // Storefronts are behind their own feature flag.
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.sellerStorefronts });
  if (!gate.ok) return <MpDenied denial={gate} />;

  const { sellerSlug } = await params;
  let seller: { id: string; storeName: string; headline: string | null } | null = null;
  let products: { id: string; slug: string; title: string; summary: string | null; versions: { priceCents: number; currency: string }[] }[] = [];
  let reachable = true;
  try {
    seller = await prisma.marketplaceSeller.findFirst({
      where: { slug: sellerSlug, status: "APPROVED" },
      select: { id: true, storeName: true, headline: true },
    });
    if (seller) {
      products = await prisma.marketplaceProduct.findMany({
        where: { status: "PUBLISHED", sellerId: seller.id },
        orderBy: { publishedAt: "desc" },
        take: 60,
      select: {
        id: true, slug: true, title: true, summary: true,
        versions: { where: { status: "PUBLISHED" }, orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } },
      },
      });
    }
  } catch {
    reachable = false;
  }
  if (reachable && !seller) notFound();

  return (
    <>
      <MpHeader
        title={seller?.storeName ?? "Seller Store"}
        description={seller?.headline ?? undefined}
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: seller?.storeName ?? sellerSlug }]}
      />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
      <MpCard>
        <MpEmpty
          icon={Store}
          title={reachable ? "No published products yet" : "Store unavailable"}
          description={
            reachable
              ? "Products this seller publishes will be listed on their store page."
              : "The platform database could not be reached, so this store cannot be shown right now."
          }
        />
      </MpCard>
      )}
    </>
  );
}
