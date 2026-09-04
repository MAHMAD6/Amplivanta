import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Category" };

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  let category: { name: string; description: string | null } | null = null;
  let reachable = true;
  try {
    category = await prisma.marketplaceCategory.findUnique({
      where: { slug: categorySlug },
      select: { name: true, description: true },
    });
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
    </>
  );
}
