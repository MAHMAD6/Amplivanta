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
