import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ChevronRight, Image as ImageIcon, Link2, Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, InfoList, kitField } from "@/components/amplivanta/screen-kit";
import { OAUTH_PROVIDERS, isProviderConfigured } from "@/lib/oauth";
import { socialConnections, socialContext } from "@/lib/server/social-screens";
import { isStorageConfigured } from "@/lib/storage";

export const metadata: Metadata = { title: "Social Integrations" };
export const dynamic = "force-dynamic";

type SP = { tab?: string; q?: string; category?: string };

export default async function SocialIntegrationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab = ["connected", "available", "requests"].includes(sp.tab ?? "") ? (sp.tab as string) : "overview";
  const c = await socialContext();
  let connections: Awaited<ReturnType<typeof socialConnections>> = [];
  if (c) connections = await socialConnections(c.workspaceId).catch(() => []);
  const socialAvailable = ["meta", "linkedin", "youtube", "tiktok"].some((p) => OAUTH_PROVIDERS[p] && isProviderConfigured(OAUTH_PROVIDERS[p]));
  const slackAvailable = Boolean(OAUTH_PROVIDERS.slack && isProviderConfigured(OAUTH_PROVIDERS.slack));

  const items = [
    { id: "channels", category: "Publishing", icon: Send, title: "Social Channels", body: "Connect your social media accounts to create and publish content.", connected: connections.length > 0, status: connections.length ? `${connections.length} connected` : "No connection configured", available: socialAvailable, href: "/app/social/accounts" },
    { id: "media", category: "Media", icon: ImageIcon, title: "Media Source", body: "Use images and videos from your Creative Studio library in your posts.", connected: isStorageConfigured(), status: isStorageConfigured() ? "Creative Studio library" : "No connection configured", available: isStorageConfigured(), href: "/app/creative-studio/images" },
    { id: "shortener", category: "Links", icon: Link2, title: "URL Shortener", body: "Connect a URL shortening service to automatically shorten links in your posts.", connected: false, status: "No connection configured", available: false, href: "/app/social/settings" },
    { id: "notify", category: "Notifications", icon: Bell, title: "Approval Notifications", body: "Connect notification services to receive approval alerts and updates.", connected: false, status: "No connection configured", available: slackAvailable, href: "/app/integrations#catalog" },
  ].filter((i) => (tab === "connected" ? i.connected : tab === "available" ? !i.connected && i.available : true))
    .filter((i) => (!sp.category || i.category === sp.category) && (!sp.q || `${i.title} ${i.body}`.toLowerCase().includes(sp.q.toLowerCase())));

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Integrations</h1>
      <p className="mb-6 mt-1 text-[14.5px] text-ink-soft">Connect approved social channels and supporting services for publishing workflows.</p>

      <nav aria-label="Integration views" className="mb-5 flex gap-2 border-b border-line">
        {[["overview", "Overview"], ["connected", "Connected"], ["available", "Available"], ["requests", "Requests"]].map(([k, l]) => (
          <Link key={k} href={k === "overview" ? "/app/social/integrations" : `/app/social/integrations?tab=${k}`} className={cn("px-5 py-3 text-[14px] font-semibold", tab === k ? "-mb-px border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-deep-navy hover:text-[#0B5CFF]")}>{l}</Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
        <div className="min-w-0 space-y-4">
          <form method="get" className="flex flex-wrap gap-4 rounded-xl border border-line bg-white px-5 py-4">
            {tab !== "overview" && <input type="hidden" name="tab" value={tab} />}
            <label className="relative w-full max-w-[500px] flex-1">
              <span className="sr-only">Search integrations</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input name="q" defaultValue={sp.q ?? ""} placeholder="Search integrations..." className={cn(kitField, "h-11 pl-9")} />
            </label>
            <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={cn(kitField, "h-11 w-full sm:w-[300px]")}>
              <option value="">All Categories</option>
              {["Publishing", "Media", "Links", "Notifications"].map((x) => <option key={x}>{x}</option>)}
            </select>
            <button type="submit" className="h-11 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
          </form>

          {tab === "requests" ? (
            <section className="rounded-xl border border-line bg-white p-6">
              <EmptyState icon={Send} title="No integration requests" body="Requests for integrations that aren't in the catalog yet will appear here." />
            </section>
          ) : items.length === 0 ? (
            <section className="rounded-xl border border-line bg-white p-6">
              <EmptyState icon={Link2} title={tab === "connected" ? "Nothing connected yet" : "No integrations match"} body={tab === "connected" ? "Connect a social channel or media source to see it here." : "Try a different search or category."} />
            </section>
          ) : (
            items.map((i) => (
              <section key={i.id} className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-white px-6 py-5">
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><i.icon className="h-10 w-10" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[18px] font-semibold text-deep-navy">{i.title}</h2>
                  <p className="mt-1 text-[14px] text-ink-soft">{i.body}</p>
                  <p className="mt-3 flex items-center gap-2 text-[13.5px] text-ink-soft"><span className={cn("h-3 w-3 rounded-full", i.connected ? "bg-emerald-500" : "bg-ink-muted/50")} /> {i.status}</p>
                </div>
                {i.connected ? (
                  <Link href={i.href} className="rounded-md border border-[#0B5CFF] px-5 py-2.5 text-[14px] font-semibold text-[#0B5CFF]">Manage</Link>
                ) : i.available ? (
                  <Link href={i.href} className="rounded-md bg-[#0B5CFF] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]">Connect</Link>
                ) : (
                  <span className="rounded-md border border-line px-4 py-2.5 text-[13px] text-ink-muted">Not available yet</span>
                )}
                <Link href={i.href} aria-label={`Open ${i.title}`}><ChevronRight className="h-5 w-5 text-deep-navy" /></Link>
              </section>
            ))
          )}
        </div>
        <aside className="h-fit rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-deep-navy">Integration Guidance</h2>
          <InfoList
            rows={[
              { title: "Permissions & Scopes", body: "Available permissions depend on the selected service and the scopes approved during connection." },
              { title: "Synchronization", body: "Sync behavior depends on the connected service and the workspace configuration you select." },
              { title: "Reconnect", body: "Reconnect options appear when supported by the integration and its authorization state." },
              { title: "Disconnect", body: "Any affected publishing dependencies are shown before a disconnect is confirmed." },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
