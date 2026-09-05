import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Browse Products" };

const money = (c: number, cur = "USD") =>
  c === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

const PAGE_SIZE = 24;

export default async function BrowseProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; type?: string; page?: string }>;
}) {
  const { q, category, type, page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage ?? "1") || 1);

  let products:
    | { id: string; slug: string; title: string; summary: string | null; seller: { storeName: string }; versions: { priceCents: number; currency: string }[] }[]
    | null = null;
  let total = 0;
  let categories: { slug: string; name: string }[] = [];
  const where = {
    status: "PUBLISHED" as const,
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(type ? { type: type as never } : {}),
  };
  try {
    [total, categories] = await Promise.all([
      prisma.marketplaceProduct.count({ where }),
      prisma.marketplaceCategory.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { slug: true, name: true },
      }),
    ]);
    products = await prisma.marketplaceProduct.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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

      <form className="mb-6 flex flex-wrap gap-3">
        <label className="flex h-12 min-w-[240px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-white px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products..."
            className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
          />
        </label>
        <select name="category" defaultValue={category ?? ""} aria-label="Category" className="h-12 rounded-xl border border-line bg-white px-4 text-[13.5px]">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} aria-label="Product type" className="h-12 rounded-xl border border-line bg-white px-4 text-[13.5px]">
          <option value="">All types</option>
          {["TEMPLATE", "IMAGE", "VIDEO", "GRAPHIC", "DOCUMENT", "TOOL_KIT"].map((t) => (
            <option key={t} value={t}>{t.replace("_", " ").toLowerCase()}</option>
          ))}
        </select>
        <button type="submit" className="h-12 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white hover:bg-royal-soft">
          Apply
        </button>
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

      {products && total > PAGE_SIZE && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={{ pathname: "/app/marketplace/products", query: { q, category, type, page: page - 1 } }}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft"
            >
              Previous
            </Link>
          )}
          <span className="text-[13px] text-ink-soft">
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          {page * PAGE_SIZE < total && (
            <Link
              href={{ pathname: "/app/marketplace/products", query: { q, category, type, page: page + 1 } }}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft"
            >
              Next
            </Link>
          )}
        </nav>
      )}

      <MpNote title="How listings appear">
        A product becomes discoverable only after it reaches the published state through moderation.
        Drafts, submissions and unpublished versions are never listed.
      </MpNote>
    </>
  );
}
