import "server-only";
import { db } from "@/lib/db";
import { getProviderToken, tokenReason } from "@/lib/providers/tokens";
import { saveMetrics, syncWindow, type MetricRow } from "@/lib/providers/metrics";

/**
 * Growth-data connectors (External API Master Revision, wave 3).
 *
 * Each adapter reads from one provider with the workspace's own OAuth token,
 * normalizes the response into daily metric rows, and never writes provider
 * shapes into product tables. Scheduled/incremental collection is a fixed
 * trailing window, not a full history pull.
 *
 * Every connector returns a result the UI can show verbatim, including the
 * reason it could not run — an unconfigured provider is not an error state.
 */

export type SyncResult =
  | { ok: true; provider: string; rows: number; window: { from: string; to: string } }
  | { ok: false; provider: string; error: string };

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
};

const dateFromCompact = (s: string) =>
  /^\d{8}$/.test(s) ? new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00Z`) : new Date(s);

async function json(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(init.timeoutMs ?? 20000) });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : {};
}

/* ------------------------------------------------------------ Google services */

/**
 * Google connectors read the resource the workspace selected from what Google
 * returned at connect time. Recent days are re-fetched on every run and rows
 * are upserted, so a repeated sync is idempotent.
 */
async function googleToken(workspaceId: string, provider: string) {
  const t = await getProviderToken(workspaceId, provider);
  if (!t.ok) return { ok: false as const, error: tokenReason[t.reason] };
  const selected = typeof t.config.selectedResource === "string" ? t.config.selectedResource : "";
  if (!selected) return { ok: false as const, error: "Choose which resource to sync for this connection first." };
  return { ok: true as const, accessToken: t.accessToken, selected };
}

async function markSynced(workspaceId: string, provider: string) {
  await db.integration.updateMany({ where: { workspaceId, provider }, data: { lastSyncAt: new Date() } });
}

/** GA4 Data API runReport over the trailing window for the selected property. */
export async function syncGoogleAnalytics(workspaceId: string, days = 28): Promise<SyncResult> {
  const provider = "google_analytics";
  const g = await googleToken(workspaceId, provider);
  if (!g.ok) return { ok: false, provider, error: g.error };
  const propertyId = g.selected.replace(/[^0-9]/g, "");
  const w = syncWindow(days);
  try {
    const data = await json(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${g.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: w.startISO, endDate: w.endISO }],
        dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
        returnPropertyQuota: true,
      }),
    });
    const names: string[] = (data.metricHeaders ?? []).map((h: { name: string }) => h.name);
    const rows: MetricRow[] = [];
    for (const r of data.rows ?? []) {
      const date = dateFromCompact(r.dimensionValues?.[0]?.value ?? "");
      const dimension = r.dimensionValues?.[1]?.value ?? "";
      (r.metricValues ?? []).forEach((mv: { value: string }, i: number) => {
        rows.push({ provider, metric: names[i] ?? `metric_${i}`, date, dimension, value: num(mv.value) });
      });
    }
    const written = await saveMetrics(workspaceId, rows);
    await markSynced(workspaceId, provider);
    return { ok: true, provider, rows: written, window: { from: w.startISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider, error: (e as Error).message };
  }
}

/** Search Console Search Analytics: daily clicks, impressions, CTR and position for the selected site. */
export async function syncSearchConsole(workspaceId: string, days = 28): Promise<SyncResult> {
  const provider = "google_search_console";
  const g = await googleToken(workspaceId, provider);
  if (!g.ok) return { ok: false, provider, error: g.error };
  const w = syncWindow(days);
  try {
    const data = await json(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(g.selected)}/searchAnalytics/query`, {
      method: "POST",
      headers: { authorization: `Bearer ${g.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ startDate: w.startISO, endDate: w.endISO, dimensions: ["date"], rowLimit: 1000 }),
    });
    const rows: MetricRow[] = [];
    for (const r of data.rows ?? []) {
      const date = new Date(`${r.keys?.[0]}T00:00:00Z`);
      for (const metric of ["clicks", "impressions", "ctr", "position"] as const) {
        rows.push({ provider, metric, date, dimension: "", value: num(r[metric]) });
      }
    }
    const written = await saveMetrics(workspaceId, rows);
    await markSynced(workspaceId, provider);
    return { ok: true, provider, rows: written, window: { from: w.startISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider, error: (e as Error).message };
  }
}

/** Google Ads campaign performance for the selected customer (read-only). */
export async function syncGoogleAds(workspaceId: string, days = 28): Promise<SyncResult> {
  const provider = "google_ads";
  const g = await googleToken(workspaceId, provider);
  if (!g.ok) return { ok: false, provider, error: g.error };
  const customerId = g.selected.replace(/[^0-9]/g, "");
  const w = syncWindow(days);
  const version = process.env.GOOGLE_ADS_API_VERSION || "v21";
  try {
    const data = await json(`https://googleads.googleapis.com/${version}/customers/${customerId}/googleAds:search`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${g.accessToken}`,
        "content-type": "application/json",
        ...(process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? { "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN } : {}),
        ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ? { "login-customer-id": process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID } : {}),
      },
      body: JSON.stringify({
        query:
          "SELECT segments.date, campaign.name, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions " +
          `FROM campaign WHERE segments.date BETWEEN '${w.startISO}' AND '${w.endISO}'`,
      }),
    });
    const rows: MetricRow[] = [];
    for (const r of data.results ?? []) {
      const date = dateFromCompact(r.segments?.date ?? "");
      const dimension = r.campaign?.name ?? "";
      rows.push({ provider, metric: "cost", date, dimension, value: num(r.metrics?.costMicros) / 1_000_000 });
      rows.push({ provider, metric: "clicks", date, dimension, value: num(r.metrics?.clicks) });
      rows.push({ provider, metric: "impressions", date, dimension, value: num(r.metrics?.impressions) });
      rows.push({ provider, metric: "conversions", date, dimension, value: num(r.metrics?.conversions) });
    }
    const written = await saveMetrics(workspaceId, rows);
    await markSynced(workspaceId, provider);
    return { ok: true, provider, rows: written, window: { from: w.startISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider, error: (e as Error).message };
  }
}

/** YouTube Analytics daily channel metrics. Data typically lags 48-72 hours. */
export async function syncYouTube(workspaceId: string, days = 28): Promise<SyncResult> {
  const provider = "youtube";
  const g = await googleToken(workspaceId, provider);
  if (!g.ok) return { ok: false, provider, error: g.error };
  const w = syncWindow(days);
  try {
    const qs = new URLSearchParams({
      ids: `channel==${g.selected}`,
      startDate: w.startISO,
      endDate: w.endISO,
      metrics: "views,estimatedMinutesWatched,subscribersGained,likes",
      dimensions: "day",
    });
    const data = await json(`https://youtubeanalytics.googleapis.com/v2/reports?${qs}`, { headers: { authorization: `Bearer ${g.accessToken}` } });
    const headers: string[] = (data.columnHeaders ?? []).map((h: { name: string }) => h.name);
    const rows: MetricRow[] = [];
    for (const r of (data.rows ?? []) as (string | number)[][]) {
      const date = new Date(`${r[0]}T00:00:00Z`);
      headers.slice(1).forEach((metric, i) => rows.push({ provider, metric, date, dimension: "", value: num(r[i + 1]) }));
    }
    const written = await saveMetrics(workspaceId, rows);
    await markSynced(workspaceId, provider);
    return { ok: true, provider, rows: written, window: { from: w.startISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider, error: (e as Error).message };
  }
}

/* ------------------------------------------------------- Meta Marketing API */

export async function syncMetaAds(workspaceId: string, days = 28): Promise<SyncResult> {
  const provider = "meta";
  const t = await getProviderToken(workspaceId, provider);
  if (!t.ok) return { ok: false, provider: "meta_ads", error: tokenReason[t.reason] };
  const account = String((t.config.adAccountId as string) ?? "").replace(/[^0-9act_]/gi, "");
  if (!account) return { ok: false, provider: "meta_ads", error: "No Meta ad account id is configured for this connection." };

  const w = syncWindow(days);
  const version = process.env.META_API_VERSION || "v21.0";
  try {
    const params = new URLSearchParams({
      access_token: t.accessToken,
      level: "campaign",
      time_increment: "1",
      fields: "campaign_name,spend,impressions,clicks,actions",
      time_range: JSON.stringify({ since: w.startISO, until: w.endISO }),
      limit: "500",
    });
    const data = await json(`https://graph.facebook.com/${version}/${account}/insights?${params}`);
    const rows: MetricRow[] = [];
    for (const r of data.data ?? []) {
      const date = dateFromCompact(r.date_start ?? "");
      const dimension = r.campaign_name ?? "";
      rows.push({ provider: "meta_ads", metric: "cost", date, dimension, value: num(r.spend) });
      rows.push({ provider: "meta_ads", metric: "impressions", date, dimension, value: num(r.impressions) });
      rows.push({ provider: "meta_ads", metric: "clicks", date, dimension, value: num(r.clicks) });
    }
    const written = await saveMetrics(workspaceId, rows);
    return { ok: true, provider: "meta_ads", rows: written, window: { from: w.startISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider: "meta_ads", error: (e as Error).message };
  }
}

/* -------------------------------------------------------------- HubSpot CRM */

/**
 * Read-only contact import. External ids are kept so a re-sync updates the
 * same rows instead of creating duplicates, and nothing is written back to
 * HubSpot — controlled-write is a later decision.
 */
export async function syncHubspotContacts(workspaceId: string, limit = 200): Promise<SyncResult> {
  const provider = "hubspot";
  const t = await getProviderToken(workspaceId, provider);
  if (!t.ok) return { ok: false, provider, error: tokenReason[t.reason] };
  try {
    const data = await json(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${Math.min(limit, 100)}&properties=email,firstname,lastname,company,phone,lifecyclestage`,
      { headers: { authorization: `Bearer ${t.accessToken}` } },
    );
    let imported = 0;
    for (const c of data.results ?? []) {
      const email = String(c.properties?.email ?? "").toLowerCase();
      if (!email) continue;
      const name = [c.properties?.firstname, c.properties?.lastname].filter(Boolean).join(" ") || null;
      const existing = await db.contact.findFirst({ where: { workspaceId, email }, select: { id: true } });
      const fields = {
        name,
        companyName: c.properties?.company ?? null,
        phone: c.properties?.phone ?? null,
      };
      if (existing) await db.contact.update({ where: { id: existing.id }, data: fields });
      else await db.contact.create({ data: { workspaceId, email, ...fields } });
      imported++;
    }
    await db.integration.updateMany({ where: { workspaceId, provider }, data: { lastSyncAt: new Date() } });
    const w = syncWindow(0);
    return { ok: true, provider, rows: imported, window: { from: w.endISO, to: w.endISO } };
  } catch (e) {
    return { ok: false, provider, error: (e as Error).message };
  }
}

/** Which connectors a provider connection can run. */
export const SYNCS: Record<string, ((workspaceId: string) => Promise<SyncResult>)[]> = {
  google_analytics: [(w) => syncGoogleAnalytics(w)],
  google_search_console: [(w) => syncSearchConsole(w)],
  google_ads: [(w) => syncGoogleAds(w)],
  youtube: [(w) => syncYouTube(w)],
  meta: [(w) => syncMetaAds(w)],
  hubspot: [(w) => syncHubspotContacts(w)],
};
