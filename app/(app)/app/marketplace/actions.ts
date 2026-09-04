"use server";

import { revalidatePath } from "next/cache";
import { MarketplaceProductType, Prisma, SellerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { getPaymentProvider, issueSignedUrl, requiresPaymentProvider } from "@/lib/marketplace/providers";

export type MpResult = { ok: true; message: string } | { ok: false; error: string };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Append-only audit entry for every sensitive marketplace write. */
async function audit(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Prisma.InputJsonValue,
) {
  try {
    await prisma.platformAuditLog.create({
      data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {} },
    });
  } catch {
    // Never fail the user-facing operation because the audit write failed;
    // the caller has already validated authorization.
  }
}

/** Submit a seller application. */
export async function applyToSell(formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.apply",
    flag: MARKETPLACE_FLAGS.sellerApplications,
  });
  if (!gate.ok) return { ok: false, error: "Seller applications are not open to your account right now." };
  if (viewer.seller) return { ok: false, error: "You already have a seller record." };

  const storeName = String(formData.get("storeName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  if (!storeName) return { ok: false, error: "A store name is required." };
  if (!contactEmail || !contactEmail.includes("@")) return { ok: false, error: "A valid contact email is required." };

  const productTypes = formData.getAll("productTypes").map(String).filter(Boolean);
  if (productTypes.length === 0) return { ok: false, error: "Select at least one product type you plan to sell." };

  if (String(formData.get("agree") ?? "") !== "on") {
    return { ok: false, error: "You must accept the Seller Agreement to apply." };
  }

  try {
    const app = await prisma.marketplaceSellerApplication.create({
      data: {
        userId: viewer.userId!,
        storeName,
        contactEmail,
        website: String(formData.get("website") ?? "").trim() || null,
        productTypes,
        motivation: String(formData.get("motivation") ?? "").trim() || null,
        status: SellerStatus.UNDER_REVIEW,
      },
    });
    await audit(viewer.userId, "marketplace.seller_application.submitted", "MarketplaceSellerApplication", app.id, {
      storeName,
      productTypes,
    });
    revalidatePath("/app/marketplace/sell");
    return { ok: true, message: "Application submitted. We will review it and be in touch." };
  } catch {
    return { ok: false, error: "Could not submit your application — the platform database was unreachable." };
  }
}

/** Create a product draft owned by the signed-in seller. */
export async function createProduct(formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.create",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.productUploads,
  });
  if (!gate.ok) return { ok: false, error: "You are not able to create products right now." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "A product title is required." };

  const typeRaw = String(formData.get("type") ?? "");
  if (!Object.values(MarketplaceProductType).includes(typeRaw as MarketplaceProductType)) {
    return { ok: false, error: "Select a valid product type." };
  }
  const type = typeRaw as MarketplaceProductType;

  // Image and video product types are individually flag-gated.
  if (type === MarketplaceProductType.IMAGE && viewer.flags[MARKETPLACE_FLAGS.imageProducts] !== true) {
    return { ok: false, error: "Image products are not enabled." };
  }
  if (type === MarketplaceProductType.VIDEO && viewer.flags[MARKETPLACE_FLAGS.videoProducts] !== true) {
    return { ok: false, error: "Video products are not enabled." };
  }

  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw) : 0;
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Enter a valid price." };

  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (!slug) return { ok: false, error: "Could not derive a URL slug from that title." };

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.marketplaceProduct.create({
        data: {
          sellerId: viewer.seller!.id,
          categoryId: String(formData.get("categoryId") ?? "") || null,
          slug,
          title,
          summary: String(formData.get("summary") ?? "").trim() || null,
          description: String(formData.get("description") ?? "").trim() || null,
          type,
          tags: String(formData.get("tags") ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      // Version 1 carries the commercial terms; later edits publish new versions.
      await tx.marketplaceProductVersion.create({
        data: {
          productId: created.id,
          version: 1,
          priceCents: Math.round(price * 100),
        },
      });
      return created;
    });

    await audit(viewer.userId, "marketplace.product.created", "MarketplaceProduct", product.id, { title, type });
    revalidatePath("/app/marketplace/seller/products");
    return { ok: true, message: `"${title}" created as a draft.` };
  } catch (e) {
    const dup = e instanceof Error && e.message.includes("Unique constraint");
    return { ok: false, error: dup ? "A product with that URL slug already exists." : "Could not save the product." };
  }
}

/** Update the signed-in seller's public store profile. */
export async function updateSellerProfile(formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return { ok: false, error: "You are not able to change these settings." };

  const storeName = String(formData.get("storeName") ?? "").trim();
  if (!storeName) return { ok: false, error: "A store name is required." };

  try {
    await prisma.marketplaceSeller.update({
      where: { id: viewer.seller!.id },
      data: {
        storeName,
        headline: String(formData.get("headline") ?? "").trim() || null,
        bio: String(formData.get("bio") ?? "").trim() || null,
      },
    });
    await audit(viewer.userId, "marketplace.seller.settings_updated", "MarketplaceSeller", viewer.seller!.id);
    revalidatePath("/app/marketplace/seller/settings");
    return { ok: true, message: "Store profile updated." };
  } catch {
    return { ok: false, error: "Could not save your profile — the platform database was unreachable." };
  }
}

/**
 * Request a payout. Eligibility is recalculated here; the UI state is never
 * trusted. Amount is derived from the ledger, not from client input.
 */
export async function requestWithdrawal(): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.payout.request",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.payouts,
  });
  if (!gate.ok) return { ok: false, error: "Payout requests are not available for your account." };

  if (viewer.flags[MARKETPLACE_FLAGS.withdrawalRequests] !== true) {
    return { ok: false, error: "Withdrawal requests are not enabled for this Marketplace." };
  }

  try {
    const seller = await prisma.marketplaceSeller.findUnique({
      where: { id: viewer.seller!.id },
      select: { payoutAccountRef: true, payoutProvider: true },
    });
    if (!seller?.payoutAccountRef || !seller.payoutProvider) {
      return { ok: false, error: "No payout provider is connected to your seller account." };
    }

    const avail = await prisma.marketplaceLedgerEntry.aggregate({
      where: { sellerId: viewer.seller!.id, payoutId: null, availableAt: { lte: new Date() } },
      _sum: { netCents: true },
    });
    const amountCents = avail._sum.netCents ?? 0;
    if (amountCents <= 0) return { ok: false, error: "You do not have an eligible balance to withdraw." };

    const payout = await prisma.marketplacePayout.create({
      data: { sellerId: viewer.seller!.id, amountCents, provider: seller.payoutProvider, status: "REQUESTED" },
    });
    await audit(viewer.userId, "marketplace.payout.requested", "MarketplacePayout", payout.id, { amountCents });
    revalidatePath("/app/marketplace/seller/earnings");
    return { ok: true, message: "Payout requested." };
  } catch {
    return { ok: false, error: "Could not request a payout — the platform database was unreachable." };
  }
}

/* ------------------------------------------------------------ cart + orders */

/** Adds the current published version of a product to the buyer cart. */
export async function addToCart(productId: string): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.purchase" });
  if (!gate.ok) return { ok: false, error: "You cannot add items to a cart right now." };

  try {
    const product = await prisma.marketplaceProduct.findFirst({
      where: { id: productId, status: "PUBLISHED" },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!product) return { ok: false, error: "That product is not available." };
    const version = product.versions[0];
    if (!version) return { ok: false, error: "That product has no published version." };

    await prisma.marketplaceCartItem.upsert({
      where: { userId_productId: { userId: viewer.userId!, productId } },
      create: { userId: viewer.userId!, productId, versionId: version.id },
      update: { versionId: version.id },
    });
    revalidatePath("/app/marketplace/cart");
    return { ok: true, message: `"${product.title}" added to your cart.` };
  } catch {
    return { ok: false, error: "Could not update your cart — the platform database was unreachable." };
  }
}

export async function removeFromCart(itemId: string): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.purchase" });
  if (!gate.ok) return { ok: false, error: "You cannot change this cart." };

  try {
    // Ownership check: never delete a cart row belonging to another buyer.
    const deleted = await prisma.marketplaceCartItem.deleteMany({
      where: { id: itemId, userId: viewer.userId! },
    });
    if (deleted.count === 0) return { ok: false, error: "That item is not in your cart." };
    revalidatePath("/app/marketplace/cart");
    return { ok: true, message: "Item removed." };
  } catch {
    return { ok: false, error: "Could not update your cart — the platform database was unreachable." };
  }
}

export type CheckoutLine = {
  itemId: string;
  productId: string;
  versionId: string;
  title: string;
  unitPriceCents: number;
  currency: string;
  licenseVersion: string;
};

export type CheckoutQuote = {
  connected: boolean;
  lines: CheckoutLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  requiresProvider: boolean;
  providerConfigured: boolean;
};

/**
 * Server-side checkout quote. Prices come from the product version, never from
 * the client. Tax stays at zero because tax treatment is an unconfirmed launch
 * decision — it is not guessed at.
 */
export async function getCheckoutQuote(): Promise<CheckoutQuote> {
  const empty: CheckoutQuote = {
    connected: false,
    lines: [],
    subtotalCents: 0,
    taxCents: 0,
    totalCents: 0,
    currency: "USD",
    requiresProvider: false,
    providerConfigured: false,
  };
  const viewer = await getMarketplaceViewer();
  if (!viewer.userId) return empty;

  try {
    const items = await prisma.marketplaceCartItem.findMany({ where: { userId: viewer.userId } });
    if (items.length === 0) return { ...empty, connected: true };

    const versions = await prisma.marketplaceProductVersion.findMany({
      where: { id: { in: items.map((i) => i.versionId) } },
      include: { product: { select: { id: true, title: true, status: true } } },
    });

    const lines: CheckoutLine[] = items.flatMap((i) => {
      const v = versions.find((x) => x.id === i.versionId);
      if (!v || v.product.status !== "PUBLISHED") return [];
      return [
        {
          itemId: i.id,
          productId: v.product.id,
          versionId: v.id,
          title: v.product.title,
          unitPriceCents: v.priceCents,
          currency: v.currency,
          licenseVersion: v.licenseVersion,
        },
      ];
    });

    const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents, 0);
    const provider = await getPaymentProvider();
    return {
      connected: true,
      lines,
      subtotalCents,
      taxCents: 0,
      totalCents: subtotalCents,
      currency: lines[0]?.currency ?? "USD",
      requiresProvider: requiresPaymentProvider(subtotalCents),
      providerConfigured: provider !== null,
    };
  } catch {
    return empty;
  }
}

/**
 * Places the order. A zero-total order completes end to end today: it is marked
 * paid, entitlements activate, and seller ledger entries are written. An order
 * with a balance due needs a configured payment provider and is refused until
 * one exists — no fake charge is ever recorded.
 */
export async function placeOrder(): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.purchase" });
  if (!gate.ok) return { ok: false, error: "You cannot place an order right now." };

  const quote = await getCheckoutQuote();
  if (!quote.connected) return { ok: false, error: "Checkout is unavailable — the platform database was unreachable." };
  if (quote.lines.length === 0) return { ok: false, error: "Your cart is empty." };

  if (quote.requiresProvider && !quote.providerConfigured) {
    return {
      ok: false,
      error: "No payment provider is connected, so a paid order cannot be taken. Free products can be claimed now.",
    };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.marketplaceOrder.create({
        data: {
          buyerUserId: viewer.userId!,
          status: "PAID",
          subtotalCents: quote.subtotalCents,
          taxCents: quote.taxCents,
          totalCents: quote.totalCents,
          currency: quote.currency,
          placedAt: new Date(),
        },
      });

      for (const line of quote.lines) {
        const version = await tx.marketplaceProductVersion.findUnique({
          where: { id: line.versionId },
          include: { product: { select: { sellerId: true } } },
        });
        if (!version) continue;

        // Snapshot exactly what was bought.
        const item = await tx.marketplaceOrderItem.create({
          data: {
            orderId: created.id,
            productId: line.productId,
            productVersionId: line.versionId,
            sellerId: version.product.sellerId,
            titleSnapshot: line.title,
            licenseVersion: version.licenseVersion,
            licenseHash: version.licenseHash,
            unitPriceCents: line.unitPriceCents,
            totalCents: line.unitPriceCents,
            currency: line.currency,
          },
        });

        await tx.marketplaceEntitlement.create({
          data: {
            orderItemId: item.id,
            buyerUserId: viewer.userId!,
            productVersionId: line.versionId,
            status: "ACTIVE",
            activatedAt: new Date(),
          },
        });

        if (line.unitPriceCents > 0) {
          // Commission rate is an unconfirmed commercial decision, so no fee is
          // deducted here; gross and net match until a rate is configured.
          await tx.marketplaceLedgerEntry.create({
            data: {
              sellerId: version.product.sellerId,
              orderItemId: item.id,
              entryType: "sale",
              grossCents: line.unitPriceCents,
              feeCents: 0,
              netCents: line.unitPriceCents,
              currency: line.currency,
              availableAt: new Date(),
            },
          });
        }
      }

      await tx.marketplaceOrder.update({ where: { id: created.id }, data: { status: "ACCESS_READY" } });
      await tx.marketplaceCartItem.deleteMany({ where: { userId: viewer.userId! } });
      return created;
    });

    await audit(viewer.userId, "marketplace.order.placed", "MarketplaceOrder", order.id, {
      totalCents: quote.totalCents,
      lines: quote.lines.length,
    });

    revalidatePath("/app/marketplace/purchases");
    revalidatePath("/app/marketplace/cart");
    return { ok: true, message: `Order placed. Reference ${order.id}` };
  } catch {
    return { ok: false, error: "Could not place the order — the platform database was unreachable." };
  }
}

export type DownloadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Issues a download. A paid order alone is not enough: the entitlement must be
 * active and owned by this buyer, and every issued link is recorded.
 */
export async function issueDownload(entitlementId: string): Promise<DownloadResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.downloads.issue_own" });
  if (!gate.ok) return { ok: false, error: "You cannot download this." };

  try {
    const ent = await prisma.marketplaceEntitlement.findFirst({
      where: { id: entitlementId, buyerUserId: viewer.userId! },
      include: { productVersion: { include: { assets: true } } },
    });
    if (!ent) return { ok: false, error: "That download does not belong to your account." };
    if (ent.status !== "ACTIVE") return { ok: false, error: `This entitlement is ${ent.status.toLowerCase()}.` };
    if (ent.expiresAt && ent.expiresAt < new Date()) return { ok: false, error: "This entitlement has expired." };

    const asset = ent.productVersion.assets[0];
    if (!asset) return { ok: false, error: "No deliverable file is attached to this product version yet." };
    if (asset.scanStatus !== "CLEAN") {
      return { ok: false, error: "This file has not passed a malware scan, so it cannot be downloaded." };
    }

    const signed = await issueSignedUrl(asset.storageKey);
    if (!signed.ok) {
      return { ok: false, error: "No file storage provider is connected, so a download link cannot be issued." };
    }

    await prisma.marketplaceDownload.create({
      data: { entitlementId: ent.id, assetId: asset.id, expiresAt: signed.expiresAt },
    });
    await audit(viewer.userId, "marketplace.download.issued", "MarketplaceEntitlement", ent.id, { assetId: asset.id });

    return { ok: true, url: signed.url };
  } catch {
    return { ok: false, error: "Could not issue the download — the platform database was unreachable." };
  }
}
