import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Browse Products" };

const money = (c: number, cur = "USD") =>
  c === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function BrowseProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let products:
    | { id: string; slug: string; title: string; summary: string | null; seller: { storeName: string }; versions: { priceCents: number; currency: string }[] }[]
    | null = null;
  try {
    products = await prisma.marketplaceProduct.findMany({
      where: { status: "PUBLISHED", ...(q ? { title: { contains: q, mode: "insensitive" } } : {}) },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: {
        id: true, slug: true, title: true, summary: true,
        seller: { select: { storeName: true } },
        versions: { orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } },
      },
    });
  } catch {
    products = null;
  }

  return (
    <>
      <MpHeader
        title="Browse Products"
        description="Search and filter every published Marketplace product."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Browse Products" }]}
      />

      <form className="mb-6">
        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-line bg-white px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products..."
            className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
          />
        </label>
      </form>

      {products && products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/app/marketplace/products/${p.slug}`}
              className="rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-royal-blue/50"
            >
              <div className="text-[15px] font-bold text-deep-navy">{p.title}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{p.seller.storeName}</div>
              {p.summary && <p className="mt-2 line-clamp-2 text-[13px] text-ink-soft">{p.summary}</p>}
              <div className="mt-4 text-[14px] font-extrabold text-royal-blue">
                {p.versions[0] ? money(p.versions[0].priceCents, p.versions[0].currency) : "—"}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <MpCard>
          <MpEmpty
            icon={Search}
            title={products === null ? "Catalogue unavailable" : "No products found"}
            description={
              products === null
                ? "The platform database could not be reached, so the catalogue cannot be listed right now."
                : q
                  ? `No published products match "${q}".`
                  : "No products have been published yet. Approved seller products appear here once published."
            }
          />
        </MpCard>
      )}

      <MpNote title="How listings appear">
        A product becomes discoverable only after it reaches the published state through moderation.
        Drafts, submissions and unpublished versions are never listed.
      </MpNote>
    </>
  );
}
