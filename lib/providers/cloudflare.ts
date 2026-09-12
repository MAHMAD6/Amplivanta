import "server-only";

/**
 * Cloudflare read-only status (DNS / CDN / WAF).
 *
 * Deliberately read-only: the handoff is explicit that edge controls
 * supplement backend authorization and must never replace it, so nothing here
 * changes DNS or firewall configuration. Off unless a scoped API token is set.
 */

export function isCloudflareConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_API_TOKEN);
}

export type CloudflareZone = { id: string; name: string; status: string; plan: string | null };

export type CloudflareStatus =
  | { ok: true; zones: CloudflareZone[] }
  | { ok: false; error: string };

export async function loadCloudflareZones(): Promise<CloudflareStatus> {
  if (!isCloudflareConfigured()) return { ok: false, error: "No Cloudflare API token is configured." };
  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/zones?per_page=20", {
      headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, error: `Cloudflare refused the request (${res.status}).` };
    const data = (await res.json()) as {
      success?: boolean;
      result?: { id: string; name: string; status: string; plan?: { name?: string } }[];
      errors?: { message?: string }[];
    };
    if (!data.success) return { ok: false, error: data.errors?.[0]?.message ?? "Cloudflare returned an error." };
    return {
      ok: true,
      zones: (data.result ?? []).map((z) => ({ id: z.id, name: z.name, status: z.status, plan: z.plan?.name ?? null })),
    };
  } catch {
    return { ok: false, error: "Cloudflare did not respond." };
  }
}
