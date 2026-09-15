import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Diamond, Plug, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { providerName, STATUS_LABEL } from "@/lib/integrations/catalog";
import { loadIntegrationsScreen, relativeTime } from "@/lib/server/integrations-screen";
import { isSyncable } from "@/lib/providers/syncable";
import { IntegrationRowActions } from "@/components/amplivanta/integration-row-actions";

export const metadata: Metadata = { title: "Connected Apps" };
export const dynamic = "force-dynamic";

const primary = "inline-flex h-10 items-center justify-center rounded-md bg-[#0B5CFF] px-7 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]";

const OAUTH_NOTICE: Record<string, [string, boolean]> = {
  connected: ["Connected. Choose a resource if prompted, then sync.", true],
  needs_resource: ["Connected, but the account has no resources to sync yet.", false],
  scopes_missing: ["The connection was not saved because required permissions were not granted. Connect again and allow access.", false],
  reauth_required: ["Google rejected the authorization. Reconnect the service.", false],
  error: ["The connection could not be completed. Try again.", false],
  denied: ["Authorization was cancelled.", false],
  invalid_state: ["The connection request expired or did not start in this browser. Try again.", false],
  unsupported: ["That integration is not available yet.", false],
};

type SP = { q?: string; status?: string; owner?: string; oauth?: string };

export default async function ConnectedAppsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const screen = await loadIntegrationsScreen();
  const items = screen.items.filter(
    (i) =>
      (!sp.q || providerName(i.provider).toLowerCase().includes(sp.q.toLowerCase())) &&
      (!sp.status || i.status === sp.status) &&
      (!sp.owner || i.connectedByUserId === sp.owner),
  );
  const attention = screen.items.filter((i) => i.status !== "connected" || (i.resources.length > 0 && !i.selectedResource));
  const lastSync = screen.items.map((i) => i.lastSyncAt).filter((d): d is Date => Boolean(d)).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const has = screen.items.length > 0;

  const stats: [string, typeof Plug, string | null][] = [
    ["Connected Apps", Plug, has ? String(screen.items.length) : null],
    ["Needs Attention", AlertCircle, has ? String(attention.length) : null],
    ["Last Sync", RefreshCw, lastSync ? relativeTime(lastSync) : null],
    ["Sync Status", Diamond, has ? (attention.length ? "Action needed" : "Healthy") : null],
  ];
  const notice = sp.oauth ? OAUTH_NOTICE[sp.oauth] : null;

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="text-[15px] text-ink-soft">
            <Link href="/app/integrations" className="hover:underline">Integrations</Link> <span className="mx-1">/</span> Connected Apps
          </nav>
          <h1 className="mt-3 font-display text-[34px] font-bold leading-tight text-deep-navy">Connected Apps</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Manage workspace-connected applications and their current connection state.</p>
        </div>
        <Link href="/app/integrations#catalog" className={cn(primary, "mt-4")}>+ Add Integration</Link>
      </div>

      {notice && (
        <div role="status" className={cn("mt-4 rounded-lg px-4 py-3 text-[13.5px]", notice[1] ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>{notice[0]}</div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, Icon, value]) => (
          <div key={label} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-5 w-5" /></span>
            <div>
              <div className="text-[15px] font-semibold text-deep-navy">{label}</div>
              <div className="mt-2 text-[20px] font-bold leading-none text-deep-navy">{value ?? "—"}</div>
              <div className="mt-3 text-[12.5px] text-ink-muted">{value == null ? "Not available yet" : ""}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-7 rounded-xl border border-line bg-white p-5">
        <form method="get" className="flex flex-wrap gap-6">
          <label className="relative w-full max-w-[580px] flex-1">
            <span className="sr-only">Search connected apps</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search connected apps..." className="h-10 w-full rounded-md border border-line pl-8 pr-3 text-[14px] focus:border-[#0B5CFF] focus:outline-none" />
          </label>
          <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className="h-10 w-[192px] rounded-md border border-line bg-white px-3 text-[13px] font-semibold text-deep-navy">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABEL).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select name="owner" defaultValue={sp.owner ?? ""} aria-label="Owner" className="h-10 w-[200px] rounded-md border border-line bg-white px-3 text-[13px] font-semibold text-deep-navy">
            <option value="">All Owners</option>
            {screen.owners.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-line text-[14px] font-semibold text-deep-navy">
                {["App", "Connection", "Owner", "Scopes", "Last Sync", "Status", "Actions"].map((h) => <th key={h} className="px-3 py-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const [label, tone] = STATUS_LABEL[i.status] ?? [i.status, "bg-bg-soft text-ink-soft"];
                const resource = i.resources.find((r) => r.id === i.selectedResource);
                return (
                  <tr key={i.id} className="border-b border-line text-[13px] text-ink-soft last:border-0">
                    <td className="px-3 py-3.5 font-semibold text-deep-navy">{providerName(i.provider)}</td>
                    <td className="px-3 py-3.5">
                      {resource?.label ?? (i.resources.length > 1 ? "Choose a resource" : i.lastErrorMessage ?? "—")}
                    </td>
                    <td className="px-3 py-3.5">{i.ownerName ?? "—"}</td>
                    <td className="px-3 py-3.5">{i.scopes.length}</td>
                    <td className="px-3 py-3.5">{relativeTime(i.lastSyncAt)}</td>
                    <td className="px-3 py-3.5"><span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", tone)}>{label}</span></td>
                    <td className="px-3 py-3.5">
                      <IntegrationRowActions
                        id={i.id}
                        provider={i.provider}
                        name={providerName(i.provider)}
                        status={i.status}
                        resources={i.resources}
                        selected={i.selectedResource}
                        canSync={isSyncable(i.provider)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <span className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Plug className="h-7 w-7" /></span>
            <h2 className="mt-6 text-[22px] font-semibold text-deep-navy">{!screen.reachable ? "Connected apps unavailable" : has ? "No apps match these filters" : "No connected apps yet"}</h2>
            <p className="mt-2 text-[14.5px] text-ink-soft">
              {!screen.reachable ? "Connections could not be loaded right now." : "Connect an integration to manage its configuration and synchronization state here."}
            </p>
            {screen.reachable && !has && <Link href="/app/integrations#catalog" className={cn(primary, "mt-6")}>+ Add Integration</Link>}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 px-3 pb-4 md:grid-cols-2">
          <div>
            <h3 className="text-[15px] font-semibold text-deep-navy">Connection controls</h3>
            <p className="mt-1 text-[13px] text-ink-soft">Configure, reconnect, pause, and disconnect actions appear only when supported by the provider and current connection state.</p>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-deep-navy">Diagnostics</h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              {attention.length
                ? attention.map((a) => `${providerName(a.provider)}: ${a.lastErrorMessage ?? (a.status === "reauth_required" ? "reconnect required" : "choose a resource to sync")}`).join(" · ")
                : "Provider errors, permission changes, and actionable diagnostics will appear when connection data is available."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
