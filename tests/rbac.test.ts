import { describe, expect, it } from "vitest";
import { canGrant, hasPermission, type EffectiveAccess } from "@/lib/rbac-policy";

const access = (global: string[], scoped: EffectiveAccess["scoped"] = []): EffectiveAccess => ({
  global: new Set(global),
  scoped,
  degraded: false,
});

describe("hasPermission", () => {
  it("grants a global permission regardless of scope", () => {
    const a = access(["marketplace.admin.read"]);
    expect(hasPermission(a, "marketplace.admin.read")).toBe(true);
    expect(
      hasPermission(a, "marketplace.admin.read", { level: "ORGANIZATION", organizationId: "org_1" }),
    ).toBe(true);
  });

  it("refuses a permission nobody granted", () => {
    expect(hasPermission(access([]), "marketplace.admin.payouts.manage")).toBe(false);
  });

  it("does not let a scoped grant satisfy an unscoped check", () => {
    const a = access([], [
      { permission: "marketplace.admin.products.moderate", scope: { level: "ORGANIZATION", organizationId: "org_1" } },
    ]);
    // No scope supplied means "anywhere", which a single-org grant must not satisfy.
    expect(hasPermission(a, "marketplace.admin.products.moderate")).toBe(false);
  });

  it("honours a scoped grant inside its own scope", () => {
    const a = access([], [
      { permission: "marketplace.admin.products.moderate", scope: { level: "ORGANIZATION", organizationId: "org_1" } },
    ]);
    expect(
      hasPermission(a, "marketplace.admin.products.moderate", { level: "ORGANIZATION", organizationId: "org_1" }),
    ).toBe(true);
  });

  it("refuses a scoped grant in a different organization", () => {
    const a = access([], [
      { permission: "marketplace.admin.products.moderate", scope: { level: "ORGANIZATION", organizationId: "org_1" } },
    ]);
    expect(
      hasPermission(a, "marketplace.admin.products.moderate", { level: "ORGANIZATION", organizationId: "org_2" }),
    ).toBe(false);
  });

  it("refuses when the scope level differs", () => {
    const a = access([], [
      { permission: "marketplace.admin.read", scope: { level: "WORKSPACE", workspaceId: "ws_1" } },
    ]);
    expect(hasPermission(a, "marketplace.admin.read", { level: "ORGANIZATION", organizationId: "ws_1" })).toBe(false);
  });
});

describe("canGrant — privilege escalation guard", () => {
  it("lets a super admin grant anything", () => {
    expect(canGrant(access([]), "SUPER_ADMIN", ["marketplace.admin.payouts.manage"]).ok).toBe(true);
  });

  it("blocks granting a permission the granter does not hold", () => {
    const res = canGrant(access(["marketplace.admin.read"]), "ADMIN", [
      "marketplace.admin.read",
      "marketplace.admin.payouts.manage",
    ]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("marketplace.admin.payouts.manage");
  });

  it("allows granting a subset of what the granter holds", () => {
    const a = access(["marketplace.admin.read", "marketplace.admin.products.moderate"]);
    expect(canGrant(a, "ADMIN", ["marketplace.admin.read"]).ok).toBe(true);
  });

  it("treats a scoped grant as insufficient authority to hand out globally", () => {
    const a = access([], [
      { permission: "marketplace.admin.payouts.manage", scope: { level: "ORGANIZATION", organizationId: "org_1" } },
    ]);
    expect(canGrant(a, "ADMIN", ["marketplace.admin.payouts.manage"]).ok).toBe(false);
  });
});
