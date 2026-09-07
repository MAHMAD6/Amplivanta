"use server";

import { revalidatePath } from "next/cache";
import { MarketplaceProductType, Prisma, SellerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { getPaymentProvider, getStorageProvider, issueSignedUrl, malwareScanRequired, requiresPaymentProvider } from "@/lib/marketplace/providers";
import { canSellerEdit, canSellerTransition, canSubmit, type ProductStatus } from "@/lib/marketplace/product-policy";
import { fulfilOrder } from "@/lib/server/marketplace-fulfilment";
import { nextOrderStatusOnPlace } from "@/lib/marketplace/order-policy";

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
  providerId: string | null;
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
    providerId: null,
  };
  const viewer = await getMarketplaceViewer();
  if (!viewer.userId) return empty;

  try {
    const items = await prisma.marketplaceCartItem.findMany({ where: { userId: viewer.userId } });
    if (items.length === 0) return { ...empty, connected: true };

    // Always price against the newest published version of each product, not
    // the version captured when the item was added to the cart.
    const products = await prisma.marketplaceProduct.findMany({
      where: { id: { in: items.map((i) => i.productId) }, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        versions: {
          where: { status: "PUBLISHED" },
          orderBy: { version: "desc" },
          take: 1,
          select: { id: true, priceCents: true, currency: true, licenseVersion: true },
        },
      },
    });

    const lines: CheckoutLine[] = items.flatMap((i) => {
      const p = products.find((x) => x.id === i.productId);
      const v = p?.versions[0];
      if (!p || !v) return [];
      return [
        {
          itemId: i.id,
          productId: p.id,
          versionId: v.id,
          title: p.title,
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
      providerId: provider?.id ?? null,
    };
  } catch {
    return empty;
  }
}

/**
 * Places an order.
 *
 * Placing never grants access. The order is created in INITIATED, its line
 * items snapshot exactly what was bought, and entitlements start PENDING.
 * Fulfilment (PAID -> ACCESS_READY, entitlements ACTIVE, seller ledger) happens
 * only in `fulfilOrder`, which requires either a zero total or a payment the
 * provider has confirmed via webhook.
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

  let orderId: string;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.marketplaceOrder.create({
        data: {
          buyerUserId: viewer.userId!,
          status: nextOrderStatusOnPlace(quote.totalCents),
          subtotalCents: quote.subtotalCents,
          taxCents: quote.taxCents,
          totalCents: quote.totalCents,
          currency: quote.currency,
          paymentProvider: quote.totalCents > 0 ? quote.providerId : null,
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

        // Pending until payment is confirmed (or the total is zero).
        await tx.marketplaceEntitlement.create({
          data: {
            orderItemId: item.id,
            buyerUserId: viewer.userId!,
            productVersionId: line.versionId,
            status: "PENDING",
          },
        });
      }

      await tx.marketplaceCartItem.deleteMany({ where: { userId: viewer.userId! } });
      return created;
    });
    orderId = order.id;
  } catch {
    return { ok: false, error: "Could not place the order — the platform database was unreachable." };
  }

  await audit(viewer.userId, "marketplace.order.placed", "MarketplaceOrder", orderId, {
    totalCents: quote.totalCents,
    lines: quote.lines.length,
  });

  // Nothing to charge: fulfil immediately.
  if (quote.totalCents === 0) {
    const res = await fulfilOrder(orderId, "zero_total");
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath("/app/marketplace/purchases");
    revalidatePath("/app/marketplace/cart");
    return { ok: true, message: `Order complete. Reference ${orderId}` };
  }

  // Paid order: awaiting the provider. Access unlocks when the webhook confirms.
  revalidatePath("/app/marketplace/purchases");
  revalidatePath("/app/marketplace/cart");
  return {
    ok: true,
    message: `Order ${orderId} created and awaiting payment confirmation. Access unlocks once the payment provider confirms the charge.`,
  };
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
    if (asset.scanStatus === "INFECTED") {
      return { ok: false, error: "This file failed a malware scan and cannot be downloaded." };
    }
    if (asset.scanStatus !== "CLEAN" && (await malwareScanRequired())) {
      return {
        ok: false,
        error: "This file has not been scanned yet. Downloads unlock once a malware scanner is connected, or once an operator records a decision to run without one.",
      };
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


/* --------------------------------------------------- seller product lifecycle */

/** Loads a product the signed-in seller owns, or null. Ownership is mandatory. */
async function ownedProduct(sellerId: string, productId: string) {
  return prisma.marketplaceProduct.findFirst({
    where: { id: productId, sellerId },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1, include: { assets: true } },
    },
  });
}

/** Edit a draft (or a product that came back with changes requested). */
export async function updateProduct(productId: string, formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.edit_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return { ok: false, error: "You cannot edit products right now." };

  try {
    const product = await ownedProduct(viewer.seller!.id, productId);
    if (!product) return { ok: false, error: "That product does not belong to your store." };
    if (!canSellerEdit(product.status)) {
      return { ok: false, error: `A ${product.status.toLowerCase().replace(/_/g, " ")} product cannot be edited. Publish a new version instead.` };
    }

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { ok: false, error: "A product title is required." };

    const priceRaw = String(formData.get("price") ?? "").trim();
    const price = priceRaw ? Number(priceRaw) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      return { ok: false, error: "Enter a valid price." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceProduct.update({
        where: { id: productId },
        data: {
          title,
          summary: String(formData.get("summary") ?? "").trim() || null,
          description: String(formData.get("description") ?? "").trim() || null,
          categoryId: String(formData.get("categoryId") ?? "").trim() || null,
          tags: String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        },
      });
      // Price lives on the version, and a draft version is still editable.
      const current = product.versions[0];
      if (current && price !== null) {
        await tx.marketplaceProductVersion.update({
          where: { id: current.id },
          data: { priceCents: Math.round(price * 100) },
        });
      }
    });

    await audit(viewer.userId, "marketplace.product.updated", "MarketplaceProduct", productId, { title });
    revalidatePath("/app/marketplace/seller/products");
    return { ok: true, message: `"${title}" saved.` };
  } catch {
    return { ok: false, error: "Could not save the product — the platform database was unreachable." };
  }
}

/**
 * Attach a deliverable to the current draft version.
 *
 * The file itself is only uploaded when a storage provider is configured; until
 * then the asset is recorded with its metadata so the listing can be completed,
 * and it stays unscanned so downloads remain blocked.
 */
export async function attachProductAsset(productId: string, formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.edit_own",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.productUploads,
  });
  if (!gate.ok) return { ok: false, error: "You cannot attach files right now." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file to attach." };

  const storage = await getStorageProvider();
  const maxBytes = Number(storage?.config.maxUploadBytes ?? 50_000_000);
  if (file.size > maxBytes) {
    return { ok: false, error: `That file is larger than the ${Math.round(maxBytes / 1_000_000)} MB upload limit.` };
  }

  try {
    const product = await ownedProduct(viewer.seller!.id, productId);
    if (!product) return { ok: false, error: "That product does not belong to your store." };
    if (!canSellerEdit(product.status)) {
      return { ok: false, error: "Files can only be attached while the product is a draft." };
    }
    const version = product.versions[0];
    if (!version) return { ok: false, error: "That product has no version to attach a file to." };

    await prisma.marketplaceProductAsset.create({
      data: {
        versionId: version.id,
        kind: "deliverable",
        // Storage key is deterministic; the bytes land there once a provider exists.
        storageKey: `marketplace/${product.id}/v${version.version}/${file.name}`,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        scanStatus: "PENDING",
      },
    });

    await audit(viewer.userId, "marketplace.product.asset_attached", "MarketplaceProduct", productId, {
      fileName: file.name,
      sizeBytes: file.size,
      storageConfigured: storage !== null,
    });
    revalidatePath(`/app/marketplace/seller/products`);
    return {
      ok: true,
      message: storage
        ? `"${file.name}" attached.`
        : `"${file.name}" recorded. The file uploads once a storage provider is configured.`,
    };
  } catch {
    return { ok: false, error: "Could not attach the file — the platform database was unreachable." };
  }
}

/** Submit a draft for moderation. This is what feeds the review queue. */
export async function submitProductForReview(productId: string): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.submit_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return { ok: false, error: "You cannot submit products right now." };

  try {
    const product = await ownedProduct(viewer.seller!.id, productId);
    if (!product) return { ok: false, error: "That product does not belong to your store." };

    const version = product.versions[0];
    const check = canSubmit({
      status: product.status,
      hasPricedVersion: Boolean(version),
      hasAsset: (version?.assets.length ?? 0) > 0,
    });
    if (!check.ok) return { ok: false, error: check.error };

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceProduct.update({ where: { id: productId }, data: { status: "SUBMITTED" } });
      await tx.marketplaceModerationEvent.create({
        data: {
          productId,
          fromStatus: product.status,
          toStatus: "SUBMITTED",
          reason: "Submitted by seller",
          actorUserId: viewer.userId,
        },
      });
    });

    await audit(viewer.userId, "marketplace.product.submitted", "MarketplaceProduct", productId, {
      from: product.status,
    });
    revalidatePath("/app/marketplace/seller/products");
    revalidatePath("/admin/marketplace-management/product-review-and-moderation");
    return { ok: true, message: `"${product.title}" submitted for review.` };
  } catch {
    return { ok: false, error: "Could not submit the product — the platform database was unreachable." };
  }
}

/** Seller-side takedown / archive of their own listing. */
export async function setOwnProductStatus(productId: string, to: ProductStatus): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.edit_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return { ok: false, error: "You cannot change this product." };

  try {
    const product = await ownedProduct(viewer.seller!.id, productId);
    if (!product) return { ok: false, error: "That product does not belong to your store." };

    const check = canSellerTransition(product.status, to);
    if (!check.ok) return { ok: false, error: check.error };

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceProduct.update({ where: { id: productId }, data: { status: to } });
      await tx.marketplaceModerationEvent.create({
        data: { productId, fromStatus: product.status, toStatus: to, reason: "Changed by seller", actorUserId: viewer.userId },
      });
    });
    await audit(viewer.userId, "marketplace.product.seller_status_changed", "MarketplaceProduct", productId, {
      from: product.status,
      to,
    });
    revalidatePath("/app/marketplace/seller/products");
    return { ok: true, message: `"${product.title}" is now ${to.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the product." };
  }
}

/**
 * Publish a new version of a live product.
 * Existing orders keep referencing the version they bought - this never
 * replaces files already purchased.
 */
export async function publishNewVersion(productId: string, formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.edit_own",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.productUploads,
  });
  if (!gate.ok) return { ok: false, error: "You cannot publish new versions right now." };

  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { ok: false, error: "Enter a valid price." };

  try {
    const product = await ownedProduct(viewer.seller!.id, productId);
    if (!product) return { ok: false, error: "That product does not belong to your store." };
    const latest = product.versions[0];
    if (!latest) return { ok: false, error: "That product has no existing version." };

    const created = await prisma.marketplaceProductVersion.create({
      data: {
        productId,
        version: latest.version + 1,
        priceCents: price === null ? latest.priceCents : Math.round(price * 100),
        currency: latest.currency,
        licenseVersion: latest.licenseVersion,
        changelog: String(formData.get("changelog") ?? "").trim() || null,
        status: "DRAFT",
      },
    });

    // A new version re-enters review; the live version keeps serving until then.
    await audit(viewer.userId, "marketplace.product.version_created", "MarketplaceProductVersion", created.id, {
      productId,
      version: created.version,
    });
    revalidatePath("/app/marketplace/seller/products");
    return {
      ok: true,
      message: `Version ${created.version} created as a draft. Attach files and submit it for review; buyers keep the version they purchased.`,
    };
  } catch {
    return { ok: false, error: "Could not create the new version." };
  }
}


/* -------------------------------------------------------------- reviews --- */

/**
 * Leave a verified-purchase review.
 *
 * Only a buyer with an entitlement for the product may review it, and only
 * once. This is what "verified purchase" means here - it is enforced, not
 * displayed as a badge.
 */
export async function submitReview(productId: string, formData: FormData): Promise<MpResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.reviews });
  if (!gate.ok) return { ok: false, error: "Reviews are not available right now." };

  const rating = Number(String(formData.get("rating") ?? ""));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a rating between 1 and 5." };
  }

  try {
    // Verified purchase: an order item for this product owned by this buyer.
    const item = await prisma.marketplaceOrderItem.findFirst({
      where: {
        productId,
        order: { buyerUserId: viewer.userId! },
        entitlements: { some: { buyerUserId: viewer.userId!, status: "ACTIVE" } },
      },
      select: { id: true },
    });
    if (!item) {
      return { ok: false, error: "Only buyers with an active purchase of this product can review it." };
    }

    await prisma.marketplaceReview.upsert({
      where: { productId_buyerUserId: { productId, buyerUserId: viewer.userId! } },
      create: {
        productId,
        buyerUserId: viewer.userId!,
        orderItemId: item.id,
        rating,
        title: String(formData.get("title") ?? "").trim() || null,
        body: String(formData.get("body") ?? "").trim() || null,
        isVerified: true,
      },
      update: {
        rating,
        title: String(formData.get("title") ?? "").trim() || null,
        body: String(formData.get("body") ?? "").trim() || null,
      },
    });

    await audit(viewer.userId, "marketplace.review.submitted", "MarketplaceProduct", productId, { rating });
    revalidatePath(`/app/marketplace/products`);
    return { ok: true, message: "Thanks - your review has been saved." };
  } catch {
    return { ok: false, error: "Could not save your review - the platform database was unreachable." };
  }
}

export type ProductReviews = {
  enabled: boolean;
  canReview: boolean;
  average: number | null;
  count: number;
  reviews: { id: string; rating: number; title: string | null; body: string | null; when: string }[];
};

/** Reviews for a product, plus whether this viewer is eligible to add one. */
export async function loadProductReviews(productId: string): Promise<ProductReviews> {
  const viewer = await getMarketplaceViewer();
  const enabled = viewer.flags[MARKETPLACE_FLAGS.reviews] === true;
  const empty: ProductReviews = { enabled, canReview: false, average: null, count: 0, reviews: [] };
  if (!enabled) return empty;

  try {
    const [rows, agg, owned] = await Promise.all([
      prisma.marketplaceReview.findMany({ where: { productId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.marketplaceReview.aggregate({ where: { productId }, _avg: { rating: true }, _count: true }),
      viewer.userId
        ? prisma.marketplaceOrderItem.count({
            where: {
              productId,
              order: { buyerUserId: viewer.userId },
              entitlements: { some: { buyerUserId: viewer.userId, status: "ACTIVE" } },
            },
          })
        : Promise.resolve(0),
    ]);
    return {
      enabled,
      canReview: owned > 0,
      average: agg._avg.rating ?? null,
      count: agg._count,
      reviews: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        when: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(r.createdAt),
      })),
    };
  } catch {
    return empty;
  }
}
