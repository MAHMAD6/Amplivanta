import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My Purchases" };

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

const TABS = [
  ["all", "All Purchases", "/app/marketplace/purchases"],
  ["downloads", "Downloads", "/app/marketplace/purchases?tab=downloads"],
  ["favorites", "Favorites", "/app/marketplace/favorites"],
] as const;

const SORTS = [
  ["newest", "Newest"],
  ["oldest", "Oldest"],
  ["total", "Highest total"],
] as const;

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  placedAt: Date | null;
  items: { id: string; titleSnapshot: string; entitlements: { status: string }[] }[];
};

export default async function MyPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; sort?: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  const { tab = "all", q = "", sort = "newest" } = await searchParams;

  let orders: Order[] | null = null;
  try {
    orders = viewer.userId
      ? await prisma.marketplaceOrder.findMany({
          where: {
            buyerUserId: viewer.userId,
            // "Downloads" lists only orders with an active entitlement.
            ...(tab === "downloads" ? { items: { some: { entitlements: { some: { status: "ACTIVE" } } } } } : {}),
            ...(q ? { items: { some: { titleSnapshot: { contains: q, mode: "insensitive" } } } } : {}),
          },
          orderBy:
            sort === "oldest" ? { createdAt: "asc" } : sort === "total" ? { totalCents: "desc" } : { createdAt: "desc" },
          take: 100,
          select: {
            id: true, status: true, totalCents: true, currency: true, placedAt: true,
            items: { select: { id: true, titleSnapshot: true, entitlements: { select: { status: true } } } },
          },
        })
      : [];
  } catch {
    orders = null;
  }

  const filtering = Boolean(q) || tab === "downloads";

  return (
    <>
      <MpHeader
        title="My Purchases"
        description="Access Marketplace orders and available downloads."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "My Purchases" }]}
      />

      <nav aria-label="Purchase views" className="mb-5 flex gap-6 border-b border-line text-[13.5px] font-semibold">
        {TABS.map(([key, label, href]) => (
          <Link
            key={key}
            href={href}
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
          <span className="sr-only">Search purchases</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search purchases…"
            className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] focus:border-royal-blue focus:outline-none"
          />
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select name="sort" defaultValue={sort} className="h-10 rounded-xl border border-line bg-white px-3 text-[12.5px] font-semibold text-ink-soft">
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>Sort: {l}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-xl border border-line bg-white px-4 text-[12.5px] font-bold text-deep-navy hover:bg-bg-soft">
          Apply
        </button>
      </form>

      {orders && orders.length > 0 ? (
        <MpCard>
          <div className="divide-y divide-line">
            {orders.map((o) => {
              const active = o.items.filter((i) => i.entitlements.some((e) => e.status === "ACTIVE")).length;
              return (
                <Link
                  key={o.id}
                  href={`/app/marketplace/purchases/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-bg-soft"
                >
                  <div>
                    <div className="text-[14px] font-bold text-deep-navy">
                      {o.items.map((i) => i.titleSnapshot).join(", ") || "Order"}
                    </div>
                    <div className="text-[12px] text-ink-muted">
                      {o.placedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(o.placedAt) : "Not placed"} ·{" "}
                      {o.status.toLowerCase().replace(/_/g, " ")}
                      {active > 0 ? ` · ${active} download${active === 1 ? "" : "s"} available` : ""}
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-deep-navy">{money(o.totalCents, o.currency)}</span>
                </Link>
              );
            })}
          </div>
        </MpCard>
      ) : (
        <MpCard>
          <MpEmpty
            icon={ShoppingBag}
            title={
              orders === null
                ? "Purchases unavailable"
                : filtering
                  ? "No matching purchases"
                  : "No purchases yet"
            }
            description={
              orders === null
                ? "The platform database could not be reached, so your purchases cannot be shown right now."
                : filtering
                  ? "Nothing matches this view. Clear the search or switch tabs."
                  : "Purchased Marketplace products will appear here."
            }
            action={<MpButton href="/app/marketplace/products" variant="primary">Browse Products</MpButton>}
          />
        </MpCard>
      )}

      <MpNote title="Download access">
        Availability depends on order ownership, active entitlement, purchased product version, and any
        applicable refund, legal, or security restrictions.
      </MpNote>
    </>
  );
}
