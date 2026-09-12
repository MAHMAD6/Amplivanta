import "server-only";
import { prisma } from "@/lib/prisma";

/** Row loaders for the Super Admin Marketplace Management panels. */

const date = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : null;

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

export async function loadSellerApplications() {
  try {
    const rows = await prisma.marketplaceSellerApplication.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        storeName: r.storeName,
        contactEmail: r.contactEmail,
        website: r.website,
        status: r.status as string,
        createdAt: date(r.createdAt) ?? "",
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadSellers() {
  try {
    const rows = await prisma.marketplaceSeller.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { email: true } }, _count: { select: { products: true } } },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        storeName: r.storeName,
        email: r.user?.email ?? null,
        status: r.status as string,
        products: r._count.products,
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadProducts(moderationOnly: boolean) {
  try {
    const rows = await prisma.marketplaceProduct.findMany({
      where: moderationOnly ? { status: { in: ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"] } } : {},
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        seller: { select: { storeName: true } },
        // Latest version only: moderation acts on what a buyer would receive.
        versions: {
          orderBy: { version: "desc" },
          take: 1,
          include: { assets: { select: { id: true, fileName: true, scanStatus: true } } },
        },
      },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        title: r.title,
        seller: r.seller?.storeName ?? null,
        status: r.status as string,
        type: r.type as string,
        assets: (r.versions[0]?.assets ?? []).map((a) => ({
          id: a.id,
          fileName: a.fileName,
          scanStatus: a.scanStatus as string,
        })),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadOrders() {
  try {
    const rows = await prisma.marketplaceOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { buyer: { select: { email: true } } },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        buyer: r.buyer?.email ?? null,
        total: money(r.totalCents, r.currency),
        status: r.status as string,
        placed: date(r.placedAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadPayouts() {
  try {
    const rows = await prisma.marketplacePayout.findMany({
      orderBy: { requestedAt: "desc" },
      take: 200,
      include: { seller: { select: { storeName: true } } },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        seller: r.seller?.storeName ?? null,
        amount: money(r.amountCents, r.currency),
        status: r.status as string,
        requested: date(r.requestedAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

/** Marketplace Overview tiles. Null means no connected source. */
export async function loadMarketplaceOverview() {
  try {
    const [orders, sellers, products, payouts, disputes, revenue, commissions, reviews, byType] = await Promise.all([
      prisma.marketplaceOrder.count(),
      prisma.marketplaceSeller.count({ where: { status: "APPROVED" } }),
      prisma.marketplaceProduct.count({ where: { status: "PUBLISHED" } }),
      prisma.marketplacePayout.count({ where: { status: { in: ["REQUESTED", "PENDING", "PROCESSING"] } } }),
      prisma.marketplaceDispute.count({ where: { status: "open" } }),
      prisma.marketplaceOrder.aggregate({ where: { status: { in: ["PAID", "ACCESS_READY"] } }, _sum: { totalCents: true } }),
      // Platform commission is the fee side of the seller ledger.
      prisma.marketplaceLedgerEntry.aggregate({ _sum: { feeCents: true } }),
      prisma.marketplaceReview.count(),
      prisma.marketplaceProduct.groupBy({
        by: ["type"],
        where: { status: "PUBLISHED" },
        _count: { _all: true },
        orderBy: { _count: { type: "desc" } },
      }),
    ]);
    return {
      connected: true,
      totalSales: money(revenue._sum.totalCents ?? 0),
      orders: orders.toLocaleString("en-US"),
      sellers: sellers.toLocaleString("en-US"),
      products: products.toLocaleString("en-US"),
      pendingPayouts: payouts.toLocaleString("en-US"),
      openDisputes: disputes.toLocaleString("en-US"),
      totalCommissions: money(commissions._sum.feeCents ?? 0),
      reviews: reviews.toLocaleString("en-US"),
      topTypes: byType.map((r) => ({ type: r.type as string, count: r._count._all })),
    };
  } catch {
    return {
      connected: false,
      totalSales: null,
      orders: null,
      sellers: null,
      products: null,
      pendingPayouts: null,
      openDisputes: null,
      totalCommissions: null,
      reviews: null,
      topTypes: [] as { type: string; count: number }[],
    };
  }
}
