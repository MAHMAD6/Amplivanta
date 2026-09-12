import { createHmac, randomBytes } from "crypto";

/**
 * Minimal OAuth2 authorization-code registry for integration connect flows.
 * Providers are configured via env; unconfigured providers are simply unavailable.
 * `state` is a signed token (HMAC over workspaceId+provider+nonce) so the callback
 * can trust it without server-side storage.
 */
export interface OAuthProvider {
  id: string;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId?: string;
  clientSecret?: string;
}

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
    id: "youtube",
    name: "YouTube",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/yt-analytics.readonly"],
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
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

export function signState(workspaceId: string, provider: string): string {
  const payload = Buffer.from(JSON.stringify({ w: workspaceId, p: provider, n: randomBytes(8).toString("hex") })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyState(state: string): { workspaceId: string; provider: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (expected !== sig) return null;
  try {
    const { w, p } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return { workspaceId: w, provider: p };
  } catch {
    return null;
  }
}

export function authorizeUrl(provider: OAuthProvider, state: string): string {
  const params = new URLSearchParams({
    client_id: provider.clientId!,
    redirect_uri: redirectUri(provider.id),
    response_type: "code",
    scope: provider.scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `${provider.authorizeUrl}?${params.toString()}`;
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
  return res.json();
}
