import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * OAuth2 authorization-code registry for integration connect flows.
 * Providers are configured via env; unconfigured providers are simply unavailable.
 *
 * `state` is a signed, expiring token binding the workspace, user, provider,
 * post-auth return path and a random nonce; the nonce is also set as an
 * httpOnly cookie on the browser that started the flow, so a state value
 * cannot be replayed from another session (Google Services Manual §3.1).
 */
export interface OAuthProvider {
  id: string;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId?: string;
  clientSecret?: string;
  /** Google service connections: incremental auth, revocation, validation. */
  family?: "google";
}

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
// Google data connections use the integrations project, not the sign-in project.
const googleIntegrationClient = () => ({
  clientId: process.env.GOOGLE_INTEGRATIONS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET,
});

export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    id: "google",
    name: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["openid", "email", "profile"],
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  google_analytics: {
    id: "google_analytics",
    name: "Google Analytics 4",
    authorizeUrl: GOOGLE_AUTH,
    tokenUrl: GOOGLE_TOKEN,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    family: "google",
    ...googleIntegrationClient(),
  },
  google_search_console: {
    id: "google_search_console",
    name: "Google Search Console",
    authorizeUrl: GOOGLE_AUTH,
    tokenUrl: GOOGLE_TOKEN,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    family: "google",
    ...googleIntegrationClient(),
  },
  google_ads: {
    id: "google_ads",
    name: "Google Ads",
    authorizeUrl: GOOGLE_AUTH,
    tokenUrl: GOOGLE_TOKEN,
    scopes: ["https://www.googleapis.com/auth/adwords"],
    family: "google",
    // Ads uses a restricted scope, so it lives in its own Cloud project when configured.
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_INTEGRATIONS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET,
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    authorizeUrl: GOOGLE_AUTH,
    tokenUrl: GOOGLE_TOKEN,
    // Read-only in V1; upload is requested only when publishing ships.
    scopes: ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/yt-analytics.readonly"],
    family: "google",
    clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_INTEGRATIONS_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_INTEGRATIONS_CLIENT_SECRET,
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    authorizeUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || "common"}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || "common"}/oauth2/v2.0/token`,
    scopes: ["openid", "email", "profile", "offline_access", "User.Read"],
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
  meta: {
    id: "meta",
    name: "Meta",
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["ads_read", "business_management"],
    clientId: process.env.META_CLIENT_ID,
    clientSecret: process.env.META_CLIENT_SECRET,
  },
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    authorizeUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: ["crm.objects.contacts.read", "crm.objects.contacts.write"],
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
  },
};

/**
 * Phase 1.1 and Phase 2 providers from the approved inventory. The connect
 * flow exists for each, but a provider without credentials is simply
 * unavailable — never shown as connectable.
 */
const LATER_PHASE: OAuthProvider[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    authorizeUrl: `${process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com"}/services/oauth2/authorize`,
    tokenUrl: `${process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com"}/services/oauth2/token`,
    scopes: ["api", "refresh_token"],
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["r_ads_reporting", "r_ads"],
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  {
    id: "shopify",
    name: "Shopify",
    authorizeUrl: `https://${process.env.SHOPIFY_SHOP_DOMAIN || "shop.myshopify.com"}/admin/oauth/authorize`,
    tokenUrl: `https://${process.env.SHOPIFY_SHOP_DOMAIN || "shop.myshopify.com"}/admin/oauth/access_token`,
    scopes: ["read_orders", "read_customers", "read_products"],
    clientId: process.env.SHOPIFY_CLIENT_ID,
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
  },
  {
    id: "tiktok",
    name: "TikTok",
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["video.publish", "video.upload"],
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  },
  {
    id: "slack",
    name: "Slack",
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: ["chat:write", "channels:read"],
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
    clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  },
  {
    id: "microsoft-calendar",
    name: "Microsoft Calendar",
    authorizeUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || "common"}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || "common"}/oauth2/v2.0/token`,
    scopes: ["offline_access", "Calendars.ReadWrite"],
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
];
for (const p of LATER_PHASE) OAUTH_PROVIDERS[p.id] = p;

export function isProviderConfigured(p?: OAuthProvider): boolean {
  return Boolean(p?.clientId && p?.clientSecret);
}

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
export const redirectUri = (provider: string) => `${APP_URL()}/api/integrations/oauth/${provider}/callback`;

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-insecure-secret";
}

export const OAUTH_NONCE_COOKIE = "av_oauth_nonce";
const STATE_TTL_MS = 10 * 60 * 1000;

export type OAuthState = { workspaceId: string; userId: string; provider: string; returnTo: string; nonce: string };

/** Only same-site app paths are accepted as a post-auth destination. */
export function safeReturnTo(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  return /^\/app(\/[A-Za-z0-9._~\-/]*)?(\?[A-Za-z0-9._~\-=&%]*)?$/.test(v) && !v.includes("//") ? v : "/app/integrations/connected";
}

export function signState(ctx: { workspaceId: string; userId: string }, provider: string, returnTo: string): { state: string; nonce: string } {
  const nonce = randomBytes(18).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ w: ctx.workspaceId, u: ctx.userId, p: provider, r: safeReturnTo(returnTo), n: nonce, e: Date.now() + STATE_TTL_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { state: `${payload}.${sig}`, nonce };
}

export function verifyState(state: string, cookieNonce: string | undefined): OAuthState | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(createHmac("sha256", secret()).update(payload).digest("base64url"));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { w, u, p, r, n, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof e !== "number" || Date.now() > e) return null;
    if (!cookieNonce || cookieNonce !== n) return null;
    return { workspaceId: w, userId: u, provider: p, returnTo: safeReturnTo(r), nonce: n };
  } catch {
    return null;
  }
}

export function authorizeUrl(provider: OAuthProvider, state: string, opts: { forceConsent?: boolean } = {}): string {
  const params = new URLSearchParams({
    client_id: provider.clientId!,
    redirect_uri: redirectUri(provider.id),
    response_type: "code",
    scope: provider.scopes.join(" "),
    state,
    access_type: "offline",
  });
  if (provider.family === "google") {
    params.set("include_granted_scopes", "true");
    // Consent is forced only when a refresh token must be re-issued.
    if (opts.forceConsent) params.set("prompt", "consent");
  } else {
    params.set("prompt", "consent");
  }
  return `${provider.authorizeUrl}?${params.toString()}`;
}

/** Revokes a Google grant on disconnect. Best effort: the local connection is removed regardless. */
export async function revokeGoogleToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function exchangeCode(provider: OAuthProvider, code: string): Promise<Record<string, unknown>> {
  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: provider.clientId!,
      client_secret: provider.clientSecret!,
      redirect_uri: redirectUri(provider.id),
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  // obtained_at lets the token helper know when the access token expires.
  return { ...((await res.json()) as Record<string, unknown>), obtained_at: Date.now() };
}
