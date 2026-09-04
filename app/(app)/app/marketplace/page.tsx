import type { Metadata } from "next";
import { Search, Store } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote, MpStat } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Marketplace" };

async function counts() {
  try {
    const [products, categories, sellers] = await Promise.all([
      prisma.marketplaceProduct.count({ where: { status: "PUBLISHED" } }),
      prisma.marketplaceCategory.count({ where: { isActive: true } }),
      prisma.marketplaceSeller.count({ where: { status: "APPROVED" } }),
    ]);
    return { products, categories, sellers };
  } catch {
    return null;
  }
}

export default async function MarketplaceHomePage() {
  const c = await counts();
  const n = (v?: number) => (c && v !== undefined ? v.toLocaleString("en-US") : null);

  return (
    <>
      <MpHeader
        title="Marketplace"
        description="Discover downloadable marketing products built by Amplivanta sellers."
        action={<MpButton href="/app/marketplace/products" variant="primary" icon={Search}>Browse products</MpButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MpStat label="Published products" value={n(c?.products)} />
        <MpStat label="Categories" value={n(c?.categories)} />
        <MpStat label="Approved sellers" value={n(c?.sellers)} />
      </div>

      <MpCard className="mt-6">
        <MpEmpty
          icon={Store}
          title={c && c.products > 0 ? "Featured collections coming together" : "No products published yet"}
          description="Approved seller products appear here as soon as they are published, grouped by category and collection."
          action={<MpButton href="/app/marketplace/products">Browse the catalogue</MpButton>}
        />
      </MpCard>

      <MpNote title="About the Marketplace">
        The Marketplace sells downloadable marketing products. It is a separate module from the
        Partner Program (business partnerships) and the Affiliate Program (referral commissions).
      </MpNote>
    </>
  );
}
