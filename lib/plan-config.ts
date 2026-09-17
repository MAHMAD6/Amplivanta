/**
 * Plan dimensions shown on Pricing Plans Overview. Values come from
 * FeatureEntitlement rows (featureKey + limitValue) so limits are configured
 * data, never hard-coded in the interface.
 */
export const PLAN_DIMENSIONS = [
  { key: "users", label: "Users", unit: "users", kind: "limit" },
  { key: "contacts", label: "Contacts", unit: "contacts", kind: "limit" },
  { key: "email_sends", label: "Email", unit: "sends / month", kind: "allowance" },
  { key: "ai_credits", label: "AI", unit: "credits / month", kind: "allowance" },
  { key: "storage_gb", label: "Storage", unit: "GB", kind: "limit" },
  { key: "automations", label: "Automation", unit: "active workflows", kind: "entitlement" },
  { key: "connected_accounts", label: "Connected Accounts", unit: "accounts", kind: "limit" },
] as const;

export type Entitlement = { featureKey: string; limitValue: number | null; enabled: boolean };

/** Human value for one dimension, or null when the plan has no configuration for it. */
export function dimensionValue(key: string, entitlements: Entitlement[]): string | null {
  const dim = PLAN_DIMENSIONS.find((d) => d.key === key);
  const e = entitlements.find((x) => x.featureKey === key);
  if (!dim || !e) return null;
  if (!e.enabled) return "Not included";
  if (e.limitValue == null) return "Unlimited";
  return `${e.limitValue.toLocaleString("en-US")} ${dim.unit}`;
}

export const NOT_CONFIGURED: Record<(typeof PLAN_DIMENSIONS)[number]["kind"], string> = {
  limit: "Configured limit not set",
  allowance: "Configured allowance not set",
  entitlement: "Configured entitlement not set",
};

/**
 * Parses an admin-entered limit: blank removes the configuration, "unlimited"
 * means no cap, "none"/"0-off" means not included, otherwise a whole number.
 */
export function parseLimit(raw: string): { action: "remove" } | { action: "set"; enabled: boolean; limitValue: number | null } | { action: "invalid" } {
  const v = raw.trim().toLowerCase();
  if (!v) return { action: "remove" };
  if (v === "unlimited") return { action: "set", enabled: true, limitValue: null };
  if (v === "none" || v === "not included") return { action: "set", enabled: false, limitValue: null };
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000_000) return { action: "invalid" };
  return { action: "set", enabled: true, limitValue: n };
}

/** Plan price for the selected billing period; a paid plan's annual price is null unless configured. */
export function periodPrice(plan: { price: number; annualPrice: number | null }, period: "monthly" | "annual"): number | null {
  if (period === "monthly") return plan.price;
  return plan.annualPrice ?? (plan.price === 0 ? 0 : null);
}

/** Percentage saved by paying annually versus twelve monthly payments, when both exist. */
export function annualSavings(plan: { price: number; annualPrice: number | null }): number | null {
  if (plan.annualPrice == null || plan.price <= 0) return null;
  const full = plan.price * 12;
  const pct = Math.round(((full - plan.annualPrice) / full) * 100);
  return pct > 0 ? pct : null;
}
