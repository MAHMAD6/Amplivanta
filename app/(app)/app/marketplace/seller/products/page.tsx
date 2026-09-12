import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { SellerProductRows, type SellerProduct } from "@/components/marketplace/seller-products";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Products" };

const TABS: [string, string, string[]][] = [
  ["all", "All Products", []],
  ["drafts", "Drafts", ["DRAFT"]],
  ["published", "Published", ["PUBLISHED"]],
  ["review", "Under Review", ["SUBMITTED", "UNDER_REVIEW"]],
  ["changes", "Changes Requested", ["CHANGES_REQUESTED"]],
];

const CHECKLIST: [string, string][] = [
  ["Accurate information", "Titles, descriptions and previews must match what the buyer receives."],
  ["Rights & policy", "You need sufficient rights to every component, and an accurate content-creation disclosure."],
  ["Discoverability", "Clear titles, summaries and tags help buyers find the listing without keyword stuffing."],
];

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab = "all", q = "" } = await searchParams;
  const statuses = TABS.find(([k]) => k === tab)?.[2] ?? [];
  const viewer = await getMarketplaceViewer();
  const sellerId = viewer.seller?.id;

  let products: SellerProduct[] = [];
  let categories: { id: string; name: string }[] = [];
  let reachable = true;
  try {
    categories = await prisma.marketplaceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const rows = sellerId
      ? await prisma.marketplaceProduct.findMany({
          where: {
            sellerId,
            ...(statuses.length ? { status: { in: statuses as never } } : {}),
            ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1,
              include: { _count: { select: { assets: true } } },
            },
          },
        })
      : [];

    products = rows.map((r) => {
      const v = r.versions[0];
      return {
        id: r.id,
        title: r.title,
        status: r.status as string,
        updated: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(r.updatedAt),
        version: v?.version ?? null,
        assets: v?._count.assets ?? 0,
        summary: r.summary,
        description: r.description,
        tags: r.tags,
        categoryId: r.categoryId,
        priceValue: v ? v.priceCents / 100 : null,
        priceLabel: v
          ? v.priceCents === 0
            ? "Free"
            : new Intl.NumberFormat("en-US", { style: "currency", currency: v.currency }).format(v.priceCents / 100)
          : "no version",
      };
    });
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="My Products"
        description="Every product you have drafted, submitted or published."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "My Products" },
        ]}
        action={
          <MpButton href="/app/marketplace/seller/products/new" variant="primary" icon={Plus}>
            Add product
          </MpButton>
        }
      />

      <nav aria-label="Product status" className="mb-5 flex flex-wrap gap-6 border-b border-line text-[13.5px] font-semibold">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? "/app/marketplace/seller/products" : `/app/marketplace/seller/products?tab=${key}`}
            className={cn(
              "pb-3",
              key === tab ? "-mb-px border-b-2 border-royal-blue text-royal-blue" : "text-ink-muted hover:text-deep-navy",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mb-4 flex flex-wrap gap-2">
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <label className="min-w-[240px] flex-1">
          <span className="sr-only">Search your products</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] focus:border-royal-blue focus:outline-none"
          />
        </label>
        <button type="submit" className="h-10 rounded-xl border border-line bg-white px-4 text-[12.5px] font-bold text-deep-navy hover:bg-bg-soft">
          Apply
        </button>
      </form>

      {products.length > 0 ? (
        <SellerProductRows products={products} categories={categories} />
      ) : (
        <MpCard>
          <MpEmpty
            icon={Package}
            title={
              !reachable ? "Products unavailable" : q || statuses.length ? "No matching products" : "No products yet"
            }
            description={
              !reachable
                ? "The platform database could not be reached, so your products cannot be listed right now."
                : q || statuses.length
                  ? "No products match this view. Clear the search or switch tabs."
                  : "Create a product, attach its deliverable, then submit it for review. Approved products can be published to the catalogue."
            }
            action={
              <MpButton href="/app/marketplace/seller/products/new" variant="primary">
                Add your first product
              </MpButton>
            }
          />
        </MpCard>
      )}

      <MpCard className="mt-6 p-6">
        <div className="text-[14px] font-bold text-deep-navy">Listing quality checklist</div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CHECKLIST.map(([title, body]) => (
            <div key={title}>
              <div className="text-[13px] font-bold text-deep-navy">{title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </MpCard>

      <MpNote title="Review flow">
        Products move draft → submitted → under review → approved → published. A version referenced by
        a completed order stays addressable forever, so updates publish a new version rather than
        replacing files buyers already own.
      </MpNote>
    </>
  );
}
