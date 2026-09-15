import type { Metadata } from "next";
import { ArrowUpRight, Diamond, Gauge, History } from "lucide-react";
import { db } from "@/lib/db";
import { CreateApiKeyButton, RevokeKeyButton } from "@/components/amplivanta/developer-ui";
import { DataTable, EmptyState, InfoList, Pill, ScreenHeader, StatGrid, fmtDate, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "API Keys & Developer Access" };
export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const c = await settingsContext();
  let reachable = Boolean(c);
  let keys: { id: string; name: string; prefix: string; scopes: string[]; createdAt: Date; lastUsedAt: Date | null; expiresAt: Date | null }[] = [];
  if (c) {
    try {
      keys = await db.apiKey.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, prefix: true, scopes: true, createdAt: true, lastUsedAt: true, expiresAt: true } });
    } catch {
      reachable = false;
    }
  }
  const canEdit = Boolean(c?.isAdmin);
  const active = keys.filter((k) => !k.expiresAt || k.expiresAt.getTime() > Date.now());
  const last = keys.map((k) => k.lastUsedAt).filter((d): d is Date => Boolean(d)).sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Integrations", "/app/integrations"], ["API Keys & Developer Access"]]}
        title="API Keys & Developer Access"
        subtitle="Manage API keys, scopes, usage visibility, and developer access."
        actions={<CreateApiKeyButton canEdit={canEdit} />}
      />
      <StatGrid
        stats={[
          { label: "Active Keys", icon: Diamond, value: keys.length ? fmtInt(active.length) : null },
          { label: "API Requests", icon: ArrowUpRight, value: null },
          { label: "Rate Limit", icon: Gauge, value: keys.length ? "120 / min" : null, hint: keys.length ? "Default, per endpoint" : undefined },
          { label: "Last Activity", icon: History, value: last ? fmtDateTime(last) : null },
        ]}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_1fr]">
        <section className="min-h-[560px] rounded-xl border border-line bg-white p-5">
          <DataTable
            minWidth={760}
            columns={["Key Name", "Scopes", "Key", "Created", "Last Used", "Actions"]}
            rows={keys.map((k) => [
              k.name,
              <span key="s" className="flex gap-1">{k.scopes.map((s) => <Pill key={s} tone={s === "write" ? "amber" : "blue"}>{s}</Pill>)}</span>,
              <code key="p" className="text-[12px]">{k.prefix}…</code>,
              fmtDate(k.createdAt),
              k.lastUsedAt ? fmtDateTime(k.lastUsedAt) : "Never",
              <RevokeKeyButton key="r" id={k.id} canEdit={canEdit} />,
            ])}
            empty={<EmptyState icon={Diamond} title={reachable ? "No API keys yet" : "API keys unavailable"} body="Create a key when an application requires developer access." action={reachable ? <CreateApiKeyButton canEdit={canEdit} /> : undefined} />}
          />
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Developer Access Guidance</h2>
          <InfoList
            rows={[
              { title: "Secret handling", body: "The secret value is shown only when a key is created. Store it securely; it cannot be displayed again." },
              { title: "Authentication", body: "Send the key as Authorization: Bearer <key> to Amplivanta /api endpoints. Requests act on this workspace only." },
              { title: "Scopes", body: "Read-only keys can list and read records; read-and-write keys can also create and update them. Administrative actions are never available to keys." },
              { title: "Usage & limits", body: "Last-used time is recorded; requests are rate limited per endpoint." },
              { title: "Revocation", body: "Revoked keys stop authorizing requests immediately." },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
