import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { OAUTH_PROVIDERS, isProviderConfigured } from "@/lib/oauth";
import { IntegrationSyncButton } from "@/components/amplivanta/integration-sync-button";
import { IntegrationRowActions } from "@/components/amplivanta/integration-row-actions";
import { DataTable, InfoList, ScreenHeader, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";
import { integrationView } from "@/lib/server/integration-view";

export const metadata: Metadata = { title: "HubSpot Integration Setup" };
export const dynamic = "force-dynamic";

const STEPS = [["connect", "Connect"], ["objects", "Objects & Fields"], ["sync", "Sync Settings"], ["review", "Review & Activate"]] as const;

/** The HubSpot connector imports contacts; this is the exact mapping it applies. */
const FIELD_MAP: [string, string][] = [
  ["email", "Email (match key)"],
  ["firstname + lastname", "Name"],
  ["company", "Company name"],
  ["phone", "Phone"],
];

export default async function HubSpotSetupPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step: raw } = await searchParams;
  const c = await settingsContext();
  const provider = OAUTH_PROVIDERS.hubspot;
  const available = Boolean(provider && isProviderConfigured(provider));
  let conn: ReturnType<typeof integrationView> | null = null;
  if (c) {
    const row = await db.integration.findFirst({ where: { workspaceId: c.workspaceId, provider: "hubspot" } }).catch(() => null);
    const v = row ? integrationView(row) : null;
    conn = v?.hasCredentials ? v : null;
  }
  const connected = conn?.status === "connected";
  const step = STEPS.some(([k]) => k === raw) && connected ? raw! : "connect";
  const canEdit = Boolean(c?.isAdmin);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["Integrations", "/app/integrations"], ["HubSpot Setup"]]} title="HubSpot Integration Setup" subtitle="Connect and configure HubSpot for this workspace." />
      <nav aria-label="Setup steps" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STEPS.map(([k, label], i) => {
          const enabled = k === "connect" || connected;
          const cls = cn("flex h-12 items-center justify-center rounded-md border text-[13.5px] font-semibold", step === k ? "border-[#0B5CFF] bg-royal-tint/50 text-[#0B5CFF]" : "border-line bg-white text-deep-navy", !enabled && "cursor-not-allowed text-ink-muted");
          return enabled ? (
            <Link key={k} href={k === "connect" ? "/app/integrations/hubspot" : `/app/integrations/hubspot?step=${k}`} className={cls}>{i + 1}&nbsp; {label}</Link>
          ) : (
            <span key={k} className={cls} aria-disabled="true">{i + 1}&nbsp; {label}</span>
          );
        })}
      </nav>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_1.4fr]">
        <section className="flex flex-col rounded-xl border border-line bg-white p-6">
          <h2 className="text-[18px] font-semibold text-deep-navy">Connection</h2>
          {step === "objects" ? (
            <div className="mt-4">
              <p className="mb-3 text-[13px] text-ink-soft">Object: <b>Contacts</b> (import into Amplivanta CRM). Existing contacts are matched by email and updated.</p>
              <DataTable minWidth={320} columns={["HubSpot property", "Amplivanta field"]} rows={FIELD_MAP.map(([a, b]) => [a, b])} />
            </div>
          ) : step === "sync" ? (
            <div className="mt-4 space-y-3 text-[13.5px]">
              <div><div className="font-semibold text-deep-navy">Direction</div><div className="text-ink-soft">HubSpot → Amplivanta (import)</div></div>
              <div><div className="font-semibold text-deep-navy">Frequency</div><div className="text-ink-soft">On demand, from Test Sync or Connected Apps</div></div>
              <div><div className="font-semibold text-deep-navy">Batch size</div><div className="text-ink-soft">Up to 100 contacts per sync</div></div>
            </div>
          ) : step === "review" ? (
            <div className="mt-4 space-y-3 text-[13.5px]">
              <div><div className="font-semibold text-deep-navy">Status</div><div className="text-ink-soft">{conn?.status ?? "Not connected"}</div></div>
              <div><div className="font-semibold text-deep-navy">Last sync</div><div className="text-ink-soft">{conn?.lastSyncAt ? fmtDateTime(conn.lastSyncAt) : "Never"}</div></div>
              <p className="text-ink-soft">Run a sync to import contacts now. Imported records appear in CRM → Contacts.</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-royal-tint text-[24px] font-semibold text-[#3B3FD8]">H</span>
              <h3 className="mt-5 text-[20px] font-semibold text-deep-navy">{connected ? "HubSpot is connected" : conn ? "HubSpot needs attention" : "HubSpot is not connected"}</h3>
              <p className="mt-3 text-[13.5px] text-ink-soft">Authorization is completed with the provider.</p>
              <p className="mt-1 text-[13.5px] text-ink-soft">{conn ? `Connected ${conn.connectedAt ? fmtDateTime(new Date(conn.connectedAt)) : ""}` : "Requested permissions are shown during connection."}</p>
              {!conn && (available && canEdit ? (
                <a href={`/api/integrations/oauth/hubspot/start?returnTo=${encodeURIComponent("/app/integrations/hubspot")}`} className="mt-7 inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]">Connect HubSpot</a>
              ) : (
                <span className="mt-7 inline-flex h-11 items-center rounded-md border border-line px-6 text-[13.5px] text-ink-muted">{available ? "Only workspace admins can connect" : "Not available yet"}</span>
              ))}
              {conn && <Link href="/app/integrations/hubspot?step=objects" className="mt-7 inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white">Continue setup</Link>}
            </div>
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-[18px] font-semibold text-deep-navy">Configuration</h2>
          <InfoList
            rows={[
              { title: "Object & field mapping", body: connected ? "Contacts: email, name, company and phone." : "Available after connection." },
              { title: "Sync direction", body: connected ? "HubSpot → Amplivanta." : "Configure after required objects and fields are mapped." },
              { title: "Sync frequency", body: connected ? "On demand." : "Select a supported schedule after connection." },
              { title: "Connection health", body: conn ? `${conn.status.replace(/_/g, " ")}${conn.lastSyncAt ? ` · last sync ${fmtDateTime(conn.lastSyncAt)}` : ""}` : "Status appears after authorization and sync activity." },
            ]}
          />
        </section>
      </div>

      <section className="rounded-xl border border-line bg-bg-soft/40 p-6">
        <h2 className="text-[18px] font-semibold text-deep-navy">Setup Controls</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div><div className="text-[14px] font-semibold text-deep-navy">Test Sync</div><div className="text-[13px] text-ink-soft">{connected ? "Imports contacts now and reports the result." : "Available after mapping is configured."}</div></div>
          <div><div className="text-[14px] font-semibold text-deep-navy">Reconnect</div><div className="text-[13px] text-ink-soft">Shown only when a connection exists and reconnection is supported.</div></div>
          <div><div className="text-[14px] font-semibold text-deep-navy">Disconnect</div><div className="text-[13px] text-ink-soft">Requires confirmation; imported contacts stay in your CRM.</div></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {conn && canEdit && <IntegrationRowActions id={conn.id} provider="hubspot" name="HubSpot" status={conn.status} resources={[]} selected={null} canSync={false} />}
          {connected && canEdit ? <IntegrationSyncButton id={conn!.id} name="HubSpot" /> : <span className="inline-flex h-11 items-center rounded-md border border-line px-12 text-[14px] text-ink-muted">Test Sync</span>}
        </div>
      </section>
    </div>
  );
}
