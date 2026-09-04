"use server";

import { revalidatePath } from "next/cache";
import { MarketplaceProductType, Prisma, SellerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";

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
