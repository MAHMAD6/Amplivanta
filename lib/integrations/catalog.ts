import "server-only";
import { OAUTH_PROVIDERS, isProviderConfigured } from "@/lib/oauth";
import { isSyncable } from "@/lib/providers/syncable";

/**
 * Supported integration catalogue. Built from the OAuth registry, so an entry
 * is connectable only when its provider actually has server credentials —
 * nothing is listed as available that would fail on click.
 */

export type CatalogEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
  access: string;
  available: boolean;
  syncs: boolean;
};

const META: Record<string, { category: string; description: string; access: string }> = {
  google_analytics: { category: "Analytics", description: "Traffic, acquisition and conversion data from a GA4 property.", access: "Read-only" },
  google_search_console: { category: "SEO", description: "Search clicks, impressions, CTR and position for a verified site.", access: "Read-only" },
  google_ads: { category: "Advertising", description: "Campaign spend, clicks, impressions and conversions.", access: "Read-only" },
  youtube: { category: "Social", description: "Channel details and daily channel analytics.", access: "Read-only" },
  meta: { category: "Advertising", description: "Meta ads performance for connected ad accounts.", access: "Read-only" },
  hubspot: { category: "CRM", description: "Import contacts from HubSpot into your CRM.", access: "Read and write contacts" },
  salesforce: { category: "CRM", description: "Connect a Salesforce org.", access: "API access" },
  linkedin: { category: "Advertising", description: "LinkedIn ads reporting.", access: "Read-only" },
  shopify: { category: "Commerce", description: "Orders, customers and products from a Shopify store.", access: "Read-only" },
  tiktok: { category: "Social", description: "Publish approved videos to TikTok.", access: "Publish" },
  slack: { category: "Collaboration", description: "Send workspace notifications to Slack channels.", access: "Post messages" },
  "google-calendar": { category: "Productivity", description: "Create calendar events for meetings and tasks.", access: "Calendar events" },
  "microsoft-calendar": { category: "Productivity", description: "Create Outlook calendar events.", access: "Calendar events" },
};

export const CATALOG_CATEGORIES = [...new Set(Object.values(META).map((m) => m.category))].sort();

export function integrationCatalog(): CatalogEntry[] {
  return Object.entries(META)
    .filter(([id]) => OAUTH_PROVIDERS[id])
    .map(([id, m]) => ({ id, name: OAUTH_PROVIDERS[id].name, ...m, available: isProviderConfigured(OAUTH_PROVIDERS[id]), syncs: isSyncable(id) }));
}

export const providerName = (id: string) => OAUTH_PROVIDERS[id]?.name ?? id.replace(/[_-]/g, " ");

export const STATUS_LABEL: Record<string, [string, string]> = {
  connected: ["Connected", "bg-emerald-50 text-emerald-700"],
  needs_resource: ["Choose resource", "bg-amber-50 text-amber-700"],
  reauth_required: ["Reconnect required", "bg-red-50 text-red-600"],
  error: ["Error", "bg-red-50 text-red-600"],
};
