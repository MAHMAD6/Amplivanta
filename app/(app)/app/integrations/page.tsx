import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlus, Diamond, Plug, RefreshCw, Search, Star, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATALOG_CATEGORIES, integrationCatalog, providerName, STATUS_LABEL } from "@/lib/integrations/catalog";
import { loadIntegrationsScreen, relativeTime, syncedWithin } from "@/lib/server/integrations-screen";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

const primary = "inline-flex h-10 items-center justify-center rounded-md bg-[#0B5CFF] px-7 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]";
const outline = "inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-6 text-[14px] font-semibold text-deep-navy hover:bg-bg-soft";

function Empty({ icon: Icon, title, body }: { icon: typeof Plug; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-5 text-[18px] font-semibold text-deep-navy">{title}</h3>
      <p className="mt-2 max-w-[440px] text-[13px] text-ink-soft">{body}</p>
    </div>
  );
}

export default async function IntegrationsHomePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = "", category = "" } = await searchParams;
  const screen = await loadIntegrationsScreen();
  const connectedIds = new Set(screen.items.map((i) => i.provider));
  const catalog = integrationCatalog().filter(
    (c) => (!category || c.category === category) && (!q || `${c.name} ${c.description}`.toLowerCase().includes(q.toLowerCase())),
  );
  const recent = screen.items.filter((i) => i.lastSyncAt).sort((a, b) => b.lastSyncAt!.getTime() - a.lastSyncAt!.getTime()).slice(0, 6);

  const fig = (n: number) => (screen.reachable && n > 0 ? n.toLocaleString("en-US") : null);
  const stats: [string, typeof Plug, string | null, string][] = [
    ["Connected Apps", Plug, fig(screen.items.length), "connections"],
    ["Sync Activity", RefreshCw, fig(syncedWithin(screen.items, 7)), "synced in the last 7 days"],
    ["Webhooks", Webhook, fig(screen.webhooks), "endpoints"],
    ["Developer Access", Diamond, fig(screen.apiKeys), "API keys"],
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="text-[15px] text-ink-soft">Integrations <span className="mx-1">/</span> Overview</nav>
          <h1 className="mt-3 font-display text-[34px] font-bold leading-tight text-deep-navy">Integrations</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Connect and manage external services, webhooks, and developer access.</p>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href="/app/integrations/webhooks" className={outline}>Manage Webhooks</Link>
          <a href="#catalog" className={primary}>+ Add Integration</a>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, Icon, value, unit]) => (
          <div key={label} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-5 w-5" /></span>
            <div>
              <div className="text-[15px] font-semibold text-deep-navy">{label}</div>
              <div className="mt-2 text-[20px] font-bold leading-none text-deep-navy">{value ?? "—"}</div>
              <div className="mt-3 text-[12.5px] text-ink-muted">{value == null ? "Not available yet" : unit}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_655px]">
        <section id="catalog" className="scroll-mt-24 rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Integration Catalog</h2>
          <form method="get" className="mt-3 flex flex-wrap gap-4">
            <label className="relative w-full max-w-[530px] flex-1">
              <span className="sr-only">Search integrations</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input name="q" defaultValue={q} placeholder="Search integrations..." className="h-10 w-full rounded-md border border-line pl-8 pr-3 text-[14px] focus:border-[#0B5CFF] focus:outline-none" />
            </label>
            <select name="category" defaultValue={category} aria-label="Category" className="h-10 w-[195px] rounded-md border border-line bg-white px-3 text-[13px] font-semibold text-deep-navy">
              <option value="">All Categories</option>
              {CATALOG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
          </form>
          {catalog.length === 0 ? (
            <Empty icon={CirclePlus} title="No integrations match" body="Try a different search or category." />
          ) : (
            <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {catalog.map((c) => {
                const connected = connectedIds.has(c.id);
                return (
                  <li key={c.id} className="flex flex-col rounded-lg border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[14.5px] font-semibold text-deep-navy">{c.name}</div>
                        <div className="text-[12px] text-ink-muted">{c.category} · {c.access}</div>
                      </div>
                      {connected ? (
                        <Link href="/app/integrations/connected" className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">Connected</Link>
                      ) : c.available ? (
                        <a href={`/api/integrations/oauth/${c.id}/start?returnTo=${encodeURIComponent("/app/integrations/connected")}`} className="shrink-0 rounded-md bg-[#0B5CFF] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#0A4FE0]">Connect</a>
                      ) : (
                        <span className="shrink-0 rounded-full bg-bg-soft px-2.5 py-1 text-[11.5px] text-ink-muted">Not available yet</span>
                      )}
                    </div>
                    <p className="mt-2 text-[12.5px] text-ink-soft">{c.description}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Developer &amp; API</h2>
          <ul className="mt-5 space-y-5">
            {([
              ["Webhooks", "Create and manage outbound event endpoints.", "/app/integrations/webhooks"],
              ["API Keys", "Manage developer access, scopes, and key lifecycle.", "/app/integrations/api-keys"],
              ["Documentation", "Open developer guidance when published.", null],
            ] as [string, string, string | null][]).map(([title, body, href]) => {
              const inner = (
                <span className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Diamond className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-[14.5px] font-semibold text-deep-navy">{title}</span>
                    <span className="block text-[12.5px] text-ink-soft">{body}</span>
                  </span>
                </span>
              );
              return <li key={title}>{href ? <Link href={href} className="block rounded-lg hover:bg-bg-soft/60">{inner}</Link> : inner}</li>;
            })}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,693px)_minmax(0,1fr)]">
        <section className="min-h-[366px] rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Recent Sync Activity</h2>
          {recent.length === 0 ? (
            <div className="mt-12"><Empty icon={RefreshCw} title="No sync activity yet" body="Connection and synchronization results will appear after integrations are configured." /></div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((i) => {
                const [label, tone] = STATUS_LABEL[i.status] ?? [i.status, "bg-bg-soft text-ink-soft"];
                return (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="text-[14px] font-semibold text-deep-navy">{providerName(i.provider)}</div>
                      <div className="text-[12px] text-ink-muted">Synced {relativeTime(i.lastSyncAt)}</div>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", tone)}>{label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="min-h-[366px] rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Popular Integrations</h2>
          <div className="mt-12"><Empty icon={Star} title="No ranking available yet" body="Popularity or usage-based recommendations will appear only when supported data is available." /></div>
        </section>
      </div>
    </div>
  );
}
