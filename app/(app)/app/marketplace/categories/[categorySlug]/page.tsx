import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Category" };

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


export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  let category: { name: string; description: string | null } | null = null;
  let products: { id: string; slug: string; title: string; summary: string | null; versions: { priceCents: number; currency: string }[] }[] = [];
  let reachable = true;
  try {
    category = await prisma.marketplaceCategory.findUnique({
      where: { slug: categorySlug },
      select: { name: true, description: true },
    });
    if (category) {
      products = await prisma.marketplaceProduct.findMany({
        where: { status: "PUBLISHED", category: { slug: categorySlug } },
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
  if (reachable && !category) notFound();

  return (
    <>
      <MpHeader
        title={category?.name ?? "Category"}
        description={category?.description ?? undefined}
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Browse Products", href: "/app/marketplace/products" },
          { label: category?.name ?? categorySlug },
        ]}
      />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
      <MpCard>
        <MpEmpty
          icon={LayoutGrid}
          title={reachable ? "No products in this category yet" : "Category unavailable"}
          description={
            reachable
              ? "Published products assigned to this category will be listed here."
              : "The platform database could not be reached, so this category cannot be shown right now."
          }
        />
      </MpCard>
      )}
    </>
  );
}
