/**
 * Pure product state-machine policy.
 *
 * Mirrors the approved state machine:
 *   draft -> submitted -> under_review -> approved -> published
 *   under_review -> changes_requested -> draft/submitted
 *   under_review -> rejected
 *   published -> unpublished | suspended | archived
 *
 * Kept free of server-only imports so the transitions are unit-testable.
 */

export type ProductStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "SUSPENDED"
  | "ARCHIVED"
  | "REJECTED";

/** Transitions a seller may perform on their own product. */
export const SELLER_TRANSITIONS: Record<string, ProductStatus[]> = {
  DRAFT: ["SUBMITTED"],
  CHANGES_REQUESTED: ["SUBMITTED"],
  // A seller may take their own listing down, but never publish or approve it.
  PUBLISHED: ["UNPUBLISHED"],
  UNPUBLISHED: ["ARCHIVED"],
};

/** Transitions a moderator/admin may perform. */
export const ADMIN_TRANSITIONS: Record<string, ProductStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CHANGES_REQUESTED", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  CHANGES_REQUESTED: ["SUBMITTED", "DRAFT"],
  APPROVED: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["UNPUBLISHED", "SUSPENDED", "ARCHIVED"],
  UNPUBLISHED: ["PUBLISHED", "ARCHIVED"],
  SUSPENDED: ["PUBLISHED", "ARCHIVED"],
};

export type TransitionCheck = { ok: true } | { ok: false; error: string };

export function canSellerTransition(from: string, to: ProductStatus): TransitionCheck {
  const allowed = SELLER_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return { ok: false, error: `You cannot move a ${from.toLowerCase().replace(/_/g, " ")} product to ${to.toLowerCase().replace(/_/g, " ")}.` };
  }
  return { ok: true };
}

export function canAdminTransition(from: string, to: ProductStatus): TransitionCheck {
  const allowed = ADMIN_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return { ok: false, error: `A ${from.toLowerCase().replace(/_/g, " ")} product cannot move to ${to.toLowerCase().replace(/_/g, " ")}.` };
  }
  return { ok: true };
}

/** A seller may only edit a product that is not currently in review or live. */
export function canSellerEdit(status: string) {
  return status === "DRAFT" || status === "CHANGES_REQUESTED";
}

/**
 * Whether a product is ready to be submitted for review. A submission without a
 * deliverable would reach a moderator with nothing to moderate.
 */
export function canSubmit(product: { status: string; hasPricedVersion: boolean; hasAsset: boolean }): TransitionCheck {
  const t = canSellerTransition(product.status, "SUBMITTED");
  if (!t.ok) return t;
  if (!product.hasPricedVersion) return { ok: false, error: "This product has no version to submit." };
  if (!product.hasAsset) {
    return { ok: false, error: "Attach at least one deliverable file before submitting for review." };
  }
  return { ok: true };
}
