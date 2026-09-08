import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Browse Products" };

/**
 * The catalogue itself lives at /marketplace, which already carries the
 * category filter. This route exists because the approved footer links to it.
 */
export default async function BrowseProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  redirect(category ? `/marketplace?category=${encodeURIComponent(category)}` : "/marketplace");
}
