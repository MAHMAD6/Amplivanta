/**
 * Public-site analytics vocabulary. Only these event names are accepted, so
 * the anonymous endpoint cannot be used to create arbitrary rows. Events carry
 * a path, never personal data.
 */
export const SITE_EVENTS = [
  "page_view",
  "cta_click",
  "search_submitted",
  "resource_filter",
  "contact_submitted",
  "signup_started",
  "marketplace_add_to_cart",
  "outbound_click",
] as const;

export type SiteEvent = (typeof SITE_EVENTS)[number];

export const isSiteEvent = (v: unknown): v is SiteEvent =>
  typeof v === "string" && (SITE_EVENTS as readonly string[]).includes(v);

/** Normalises a path: no query, no hash, bounded length. */
export function cleanPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return "";
  return raw.split(/[?#]/)[0].slice(0, 200);
}
