/**
 * Google service adapters used at connect time (Google Services Manual §3.1
 * step 10, §6-§9): a lightweight validation call that also lists the resources
 * the authorized account can reach, so the workspace selects a property, site,
 * customer or channel from what Google returned — never from a client-supplied id.
 */

export type GoogleResource = { id: string; label: string };
export type GoogleValidation =
  | { ok: true; resources: GoogleResource[] }
  | { ok: false; code: "reauth_required" | "permission_denied" | "not_enabled" | "unavailable"; message: string };

export const GOOGLE_SERVICE_IDS = ["google_analytics", "google_search_console", "google_ads", "youtube"] as const;
export type GoogleServiceId = (typeof GOOGLE_SERVICE_IDS)[number];
export const isGoogleService = (p: string): p is GoogleServiceId => (GOOGLE_SERVICE_IDS as readonly string[]).includes(p);

/** Scopes each service must actually have been granted (users can untick scopes on the consent screen). */
export const REQUIRED_SCOPES: Record<GoogleServiceId, string[]> = {
  google_analytics: ["https://www.googleapis.com/auth/analytics.readonly"],
  google_search_console: ["https://www.googleapis.com/auth/webmasters.readonly"],
  google_ads: ["https://www.googleapis.com/auth/adwords"],
  youtube: ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/yt-analytics.readonly"],
};

export const RESOURCE_LABEL: Record<GoogleServiceId, string> = {
  google_analytics: "GA4 property",
  google_search_console: "Search Console property",
  google_ads: "Ads account",
  youtube: "YouTube channel",
};

export function missingScopes(service: GoogleServiceId, granted: string | undefined): string[] {
  const have = new Set((granted ?? "").split(/\s+/).filter(Boolean));
  return REQUIRED_SCOPES[service].filter((s) => !have.has(s));
}

async function get(url: string, token: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}`, ...headers }, signal: AbortSignal.timeout(15000) });
  const body = await res.text();
  return { status: res.status, ok: res.ok, data: body ? (JSON.parse(body) as Record<string, unknown>) : {} };
}

function failure(status: number): GoogleValidation {
  if (status === 401) return { ok: false, code: "reauth_required", message: "Google rejected the authorization. Reconnect the service." };
  if (status === 403) return { ok: false, code: "permission_denied", message: "The Google account does not have access, or the API is not enabled for this project." };
  return { ok: false, code: "unavailable", message: "Google did not respond. Try again shortly." };
}

export async function validateGoogleService(service: GoogleServiceId, accessToken: string): Promise<GoogleValidation> {
  try {
    if (service === "google_analytics") {
      const r = await get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", accessToken);
      if (!r.ok) return failure(r.status);
      const summaries = (r.data.accountSummaries ?? []) as { displayName?: string; propertySummaries?: { property?: string; displayName?: string }[] }[];
      const resources = summaries.flatMap((a) =>
        (a.propertySummaries ?? [])
          .filter((p) => typeof p.property === "string")
          .map((p) => ({ id: (p.property as string).replace(/^properties\//, ""), label: `${p.displayName ?? p.property} · ${a.displayName ?? "Account"}` })),
      );
      return { ok: true, resources };
    }
    if (service === "google_search_console") {
      const r = await get("https://www.googleapis.com/webmasters/v3/sites", accessToken);
      if (!r.ok) return failure(r.status);
      const sites = (r.data.siteEntry ?? []) as { siteUrl?: string; permissionLevel?: string }[];
      return {
        ok: true,
        resources: sites
          .filter((s) => s.siteUrl && s.permissionLevel !== "siteUnverifiedUser")
          .map((s) => ({ id: s.siteUrl as string, label: s.siteUrl as string })),
      };
    }
    if (service === "google_ads") {
      const version = process.env.GOOGLE_ADS_API_VERSION || "v21";
      // Developer tokens were sunset for new access levels (Sept 2026); send one only if still configured.
      const headers: Record<string, string> = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? { "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN } : {};
      const r = await get(`https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`, accessToken, headers);
      if (!r.ok) return failure(r.status);
      const names = (r.data.resourceNames ?? []) as string[];
      return { ok: true, resources: names.map((n) => { const id = n.replace(/^customers\//, ""); return { id, label: `Customer ${id.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}` }; }) };
    }
    const r = await get("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", accessToken);
    if (!r.ok) return failure(r.status);
    const items = (r.data.items ?? []) as { id?: string; snippet?: { title?: string } }[];
    return { ok: true, resources: items.filter((i) => i.id).map((i) => ({ id: i.id as string, label: i.snippet?.title ?? (i.id as string) })) };
  } catch {
    return { ok: false, code: "unavailable", message: "Google did not respond. Try again shortly." };
  }
}
