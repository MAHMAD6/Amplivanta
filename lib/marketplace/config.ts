/**
 * Marketplace module registration — Phase 0 of the approved integration handoff.
 *
 * The module id, feature-flag keys, permissions and role grants are declared in
 * code as the source of truth. Database rows (ModuleControl / FeatureFlag) act
 * as operator overrides on top of these declarations, so nothing has to be
 * seeded for the platform to behave correctly.
 *
 * Marketplace  = downloadable marketing products
 * Partner Program = business/solution partnerships
 * Affiliate Program = referral/commission relationships
 * These are deliberately separate modules — do not collapse them.
 */

export const MARKETPLACE_MODULE_ID = "marketplace";

export const MARKETPLACE_MODULE = {
  key: MARKETPLACE_MODULE_ID,
  name: "Marketplace",
  description: "Downloadable marketing products, seller onboarding, orders and payouts.",
  category: "Commerce",
  /**
   * Disabling hides navigation and blocks user routes but never deletes
   * orders, products, licenses or payout records, and admin/audit access
   * to existing data is preserved.
   */
  isCore: false,
} as const;

/** Ordered exactly as the approved module-control spec requires. */
export const MARKETPLACE_EVALUATION_ORDER = [
  "global module kill switch",
  "plan/entitlement",
  "organization/workspace override",
  "authentication and tenancy",
  "RBAC",
  "seller/buyer ownership or eligibility",
  "feature flag",
] as const;

export const MARKETPLACE_FLAGS = {
  sellerApplications: "marketplace.seller_applications",
  productUploads: "marketplace.product_uploads",
  sellerStorefronts: "marketplace.seller_storefronts",
  imageProducts: "marketplace.image_products",
  videoProducts: "marketplace.video_products",
  reviews: "marketplace.reviews",
  favorites: "marketplace.favorites",
  coupons: "marketplace.coupons",
  bundles: "marketplace.bundles",
  sellerPromotion: "marketplace.seller_promotion",
  affiliatePromotion: "marketplace.affiliate_promotion",
  sponsoredListings: "marketplace.sponsored_listings",
  payouts: "marketplace.payouts",
  withdrawalRequests: "marketplace.withdrawal_requests",
  storeFollows: "marketplace.store_follows",
} as const;

export type MarketplaceFlag = (typeof MARKETPLACE_FLAGS)[keyof typeof MARKETPLACE_FLAGS];

export const MARKETPLACE_FLAG_REGISTRY: {
  key: MarketplaceFlag;
  name: string;
  purpose: string;
  surface: string[];
  /**
   * Whether code actually reads this flag yet. Flags that nothing reads are
   * surfaced as such in the admin console so toggling one is never mistaken
   * for enabling a feature that does not exist.
   */
  implemented: boolean;
}[] = [
  { key: MARKETPLACE_FLAGS.sellerApplications, name: "Seller applications", purpose: "Allow eligible users to apply to sell", surface: ["user", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.productUploads, name: "Product uploads", purpose: "Allow approved sellers to create and submit products", surface: ["seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.sellerStorefronts, name: "Seller storefronts", purpose: "Expose seller store/public profile pages", surface: ["buyer", "seller"], implemented: true },
  { key: MARKETPLACE_FLAGS.imageProducts, name: "Image products", purpose: "Allow image product type", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.videoProducts, name: "Video products", purpose: "Allow video product type", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.reviews, name: "Reviews", purpose: "Enable verified-purchase review features", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.favorites, name: "Favorites", purpose: "Enable favorites/wishlist behavior", surface: ["buyer"], implemented: true },
  { key: MARKETPLACE_FLAGS.coupons, name: "Coupons", purpose: "Enable seller/marketplace coupon functionality", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.bundles, name: "Bundles", purpose: "Enable multi-product bundles", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.sellerPromotion, name: "Seller promotion", purpose: "Connect seller products to Amplivanta promotion tools", surface: ["seller"], implemented: true },
  { key: MARKETPLACE_FLAGS.affiliatePromotion, name: "Affiliate promotion", purpose: "Allow affiliate promotion of Marketplace products", surface: ["seller", "affiliate", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.sponsoredListings, name: "Sponsored listings", purpose: "Allow clearly labeled paid/curated placement", surface: ["buyer", "seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.payouts, name: "Payouts", purpose: "Enable seller payout processing", surface: ["seller", "admin"], implemented: true },
  { key: MARKETPLACE_FLAGS.storeFollows, name: "Store follows", purpose: "Let buyers follow seller stores", surface: ["buyer", "seller"], implemented: true },
  { key: MARKETPLACE_FLAGS.withdrawalRequests, name: "Withdrawal requests", purpose: "Allow sellers to request withdrawals", surface: ["seller", "admin"], implemented: true },
];

export const MARKETPLACE_PERMISSIONS = [
  "marketplace.browse",
  "marketplace.purchase",
  "marketplace.purchases.read_own",
  "marketplace.downloads.issue_own",
  "marketplace.seller.apply",
  "marketplace.seller.dashboard.read",
  "marketplace.seller.products.create",
  "marketplace.seller.products.edit_own",
  "marketplace.seller.products.submit_own",
  "marketplace.seller.orders.read_own",
  "marketplace.seller.earnings.read_own",
  "marketplace.seller.payout.request",
  "marketplace.seller.settings.manage",
  "marketplace.admin.read",
  "marketplace.admin.sellers.manage",
  "marketplace.admin.seller_applications.review",
  "marketplace.admin.products.moderate",
  "marketplace.admin.products.manage",
  "marketplace.admin.orders.manage",
  "marketplace.admin.refunds.manage",
  "marketplace.admin.disputes.manage",
  "marketplace.admin.payouts.manage",
  "marketplace.admin.settings.manage",
] as const;

export type MarketplacePermission = (typeof MARKETPLACE_PERMISSIONS)[number];

const BUYER_BASE: MarketplacePermission[] = [
  "marketplace.browse",
  "marketplace.purchase",
  "marketplace.purchases.read_own",
  "marketplace.downloads.issue_own",
  "marketplace.seller.apply",
];

export const MARKETPLACE_ROLE_GRANTS: Record<string, MarketplacePermission[]> = {
  authenticated_buyer: BUYER_BASE,
  seller_applicant: BUYER_BASE,
  approved_seller: [
    "marketplace.browse",
    "marketplace.purchase",
    "marketplace.purchases.read_own",
    "marketplace.downloads.issue_own",
    "marketplace.seller.dashboard.read",
    "marketplace.seller.products.create",
    "marketplace.seller.products.edit_own",
    "marketplace.seller.products.submit_own",
    "marketplace.seller.orders.read_own",
    "marketplace.seller.earnings.read_own",
    "marketplace.seller.payout.request",
    "marketplace.seller.settings.manage",
  ],
  marketplace_moderator: [
    "marketplace.admin.read",
    "marketplace.admin.seller_applications.review",
    "marketplace.admin.products.moderate",
  ],
  marketplace_operations_admin: [
    "marketplace.admin.read",
    "marketplace.admin.sellers.manage",
    "marketplace.admin.seller_applications.review",
    "marketplace.admin.products.moderate",
    "marketplace.admin.products.manage",
    "marketplace.admin.orders.manage",
    "marketplace.admin.refunds.manage",
    "marketplace.admin.disputes.manage",
  ],
  marketplace_finance_admin: [
    "marketplace.admin.read",
    "marketplace.admin.orders.manage",
    "marketplace.admin.refunds.manage",
    "marketplace.admin.disputes.manage",
    "marketplace.admin.payouts.manage",
  ],
  super_admin: [...MARKETPLACE_PERMISSIONS],
};

/**
 * Authorization rules carried over verbatim from the approved RBAC spec.
 * Restated here so they stay visible next to the code that enforces them.
 */
export const MARKETPLACE_AUTHZ_RULES = [
  "UI visibility is not authorization.",
  "Resolve User -> Organization/Workspace -> Role -> Permissions before business-data access.",
  "Seller ownership checks are mandatory for seller product/order/earnings operations.",
  "Buyer order ownership checks are mandatory for purchase details and download URL issuance.",
  "Admin operations must emit append-only audit events.",
] as const;
