import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, AtSign, FileText, HeartPulse, Link2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialGlyph } from "@/components/amplivanta/social-glyph";
import { OAUTH_PROVIDERS, isProviderConfigured } from "@/lib/oauth";
import { socialConnections, socialContext } from "@/lib/server/social-screens";
import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Social Accounts" };
export const dynamic = "force-dynamic";

type SP = { status?: string; platform?: string };

export default async function SocialAccountsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let connections: Awaited<ReturnType<typeof socialConnections>> = [];
  if (c) {
    try {
      connections = await socialConnections(c.workspaceId);
    } catch {
      connections = [];
    }
  }
  const cards = SOCIAL_PLATFORMS.map((p) => {
    const conn = p.provider ? connections.find((x) => x.provider === p.provider) : undefined;
    const provider = p.provider ? OAUTH_PROVIDERS[p.provider] : undefined;
    const status = conn ? (conn.status === "connected" ? "connected" : "attention") : "not_connected";
    return { ...p, conn, status, connectable: Boolean(provider && isProviderConfigured(provider)) };
  }).filter((p) => (!sp.platform || p.id === sp.platform) && (!sp.status || p.status === sp.status));

  const link = "inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#0B5CFF] hover:underline";

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-bold text-deep-navy">Social Accounts</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">Connect, manage, and monitor your supported social accounts.</p>
        </div>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <Link href="/app/integrations#catalog" className="inline-flex h-12 items-center rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]">+ Connect Account</Link>
          <label className="flex h-14 w-[220px] flex-col justify-center rounded-md border border-line bg-white px-3">
            <span className="text-[12px] text-ink-soft">Status</span>
            <select name="status" defaultValue={sp.status ?? ""} className="bg-transparent text-[13.5px] text-deep-navy focus:outline-none">
              <option value="">All Statuses</option>
              <option value="connected">Connected</option>
              <option value="attention">Needs attention</option>
              <option value="not_connected">Not connected</option>
            </select>
          </label>
          <label className="flex h-14 w-[220px] flex-col justify-center rounded-md border border-line bg-white px-3">
            <span className="text-[12px] text-ink-soft">Platform</span>
            <select name="platform" defaultValue={sp.platform ?? ""} className="bg-transparent text-[13.5px] text-deep-navy focus:outline-none">
              <option value="">All Platforms</option>
              {SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <button type="submit" className="h-14 rounded-md border border-line bg-white px-4 text-[13px] font-semibold text-deep-navy">Apply</button>
        </form>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {cards.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border border-line bg-white p-5">
            <span className="h-12 w-12" style={{ color: p.color }}>{p.id === "threads" ? <AtSign className="h-11 w-11" /> : <SocialGlyph name={p.id} className="h-11 w-11" />}</span>
            <h2 className="mt-4 text-[18px] font-semibold text-deep-navy">{p.label}</h2>
            <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
              <span className={cn("h-2.5 w-2.5 rounded-full", p.status === "connected" ? "bg-emerald-500" : p.status === "attention" ? "bg-amber-500" : "bg-ink-muted/50")} />
              {p.status === "connected" ? "Connected" : p.status === "attention" ? "Needs attention" : "Not connected"}
            </div>
            <p className="mt-3 flex-1 text-[13.5px] text-deep-navy">{p.conn?.resources.find((r) => r.id === p.conn?.selectedResource)?.label ?? p.connectDescription}</p>
            {p.conn ? (
              <Link href="/app/integrations/connected" className="mt-4 flex h-11 items-center justify-center rounded-md border border-[#0B5CFF] text-[14px] font-semibold text-[#0B5CFF] hover:bg-royal-tint">Manage</Link>
            ) : p.connectable ? (
              <a href={`/api/integrations/oauth/${p.provider}/start?returnTo=${encodeURIComponent("/app/social/accounts")}`} className="mt-4 flex h-11 items-center justify-center rounded-md border border-[#0B5CFF] text-[14px] font-semibold text-[#0B5CFF] hover:bg-royal-tint">Connect</a>
            ) : (
              <span className="mt-4 flex h-11 items-center justify-center rounded-md border border-line text-[13px] text-ink-muted">Not available yet</span>
            )}
            <div className="mt-4 space-y-2 border-t border-line pt-3 text-[13px]">
              <Link href="/app/integrations" className={link}><FileText className="h-4 w-4" /> Requirements</Link>
              <Link href="/app/integrations/connected" className={link}><ShieldCheck className="h-4 w-4" /> View Permissions</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {([
          [Link2, "Connection Guide", "Connect accounts from the Integrations catalog, then choose which page, channel or profile to use.", "View Connection Guide", "/app/integrations#catalog"],
          [ShieldCheck, "Permissions & Scopes", "Available connection permissions depend on the connected platform and the scopes you approve.", "Learn About Permissions", "/app/integrations/connected"],
          [HeartPulse, "Account Health", "Connections that need reauthorization are flagged in Connected Apps.", "View Health", "/app/integrations/connected"],
        ] as const).map(([Icon, title, body, cta, href]) => (
          <div key={title} className="flex gap-5 rounded-xl border border-line bg-white p-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-7 w-7" /></span>
            <div>
              <h2 className="text-[16px] font-semibold text-deep-navy">{title}</h2>
              <p className="mt-1 text-[13.5px] text-ink-soft">{body}</p>
              <Link href={href} className={cn(link, "mt-3")}>{cta}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-royal-tint/30 p-5">
        <AlertTriangle className="h-12 w-12 text-[#3B3FD8]" />
        <div className="flex-1">
          <h2 className="text-[16px] font-semibold text-deep-navy">Reauthentication &amp; Disconnect</h2>
          <ul className="mt-1 list-disc pl-5 text-[13.5px] text-deep-navy">
            <li>Social platforms may require reauthentication periodically to maintain connection.</li>
            <li>Disconnecting an account will stop all scheduled and future publishing for that platform.</li>
          </ul>
        </div>
        <Link href="/app/integrations/connected" className="rounded-md border border-[#0B5CFF] bg-white px-6 py-3 text-[14px] font-semibold text-[#0B5CFF]">Learn More</Link>
      </div>
    </div>
  );
}
