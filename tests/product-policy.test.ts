import { describe, expect, it } from "vitest";
import {
  canAdminTransition,
  canSellerEdit,
  canSellerTransition,
  canSubmit,
} from "@/lib/marketplace/product-policy";

describe("seller transitions", () => {
  it("lets a seller submit a draft — the step that feeds the review queue", () => {
    expect(canSellerTransition("DRAFT", "SUBMITTED").ok).toBe(true);
  });

  it("lets a seller resubmit after changes were requested", () => {
    expect(canSellerTransition("CHANGES_REQUESTED", "SUBMITTED").ok).toBe(true);
  });

  it("never lets a seller publish their own product", () => {
    expect(canSellerTransition("APPROVED", "PUBLISHED").ok).toBe(false);
    expect(canSellerTransition("DRAFT", "PUBLISHED").ok).toBe(false);
  });

  it("never lets a seller approve their own product", () => {
    expect(canSellerTransition("UNDER_REVIEW", "APPROVED").ok).toBe(false);
  });

  it("lets a seller take down their own live listing", () => {
    expect(canSellerTransition("PUBLISHED", "UNPUBLISHED").ok).toBe(true);
  });

  it("refuses to edit a product that is in review or live", () => {
    expect(canSellerEdit("DRAFT")).toBe(true);
    expect(canSellerEdit("CHANGES_REQUESTED")).toBe(true);
    expect(canSellerEdit("UNDER_REVIEW")).toBe(false);
    expect(canSellerEdit("PUBLISHED")).toBe(false);
  });
});

describe("canSubmit", () => {
  const ready = { status: "DRAFT", hasPricedVersion: true, hasAsset: true };

  it("allows a complete draft through", () => {
    expect(canSubmit(ready).ok).toBe(true);
  });

  it("refuses a submission with no deliverable attached", () => {
    const res = canSubmit({ ...ready, hasAsset: false });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/deliverable/i);
  });

  it("refuses a product with no version", () => {
    expect(canSubmit({ ...ready, hasPricedVersion: false }).ok).toBe(false);
  });

  it("refuses to resubmit something already under review", () => {
    expect(canSubmit({ ...ready, status: "UNDER_REVIEW" }).ok).toBe(false);
  });
});

describe("admin transitions", () => {
  it("walks the approved happy path", () => {
    expect(canAdminTransition("SUBMITTED", "UNDER_REVIEW").ok).toBe(true);
    expect(canAdminTransition("UNDER_REVIEW", "APPROVED").ok).toBe(true);
    expect(canAdminTransition("APPROVED", "PUBLISHED").ok).toBe(true);
  });

  it("supports the changes-requested branch", () => {
    expect(canAdminTransition("UNDER_REVIEW", "CHANGES_REQUESTED").ok).toBe(true);
  });

  it("refuses to publish straight from submitted", () => {
    expect(canAdminTransition("SUBMITTED", "PUBLISHED").ok).toBe(false);
  });

  it("refuses to revive an archived product", () => {
    expect(canAdminTransition("ARCHIVED", "PUBLISHED").ok).toBe(false);
  });

  it("allows enforcement against a live listing", () => {
    expect(canAdminTransition("PUBLISHED", "SUSPENDED").ok).toBe(true);
  });
});
