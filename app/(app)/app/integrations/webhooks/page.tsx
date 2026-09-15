import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { CreateWebhookButton, WebhookRowActions } from "@/components/amplivanta/developer-ui";
import { DataTable, EmptyState, InfoList, Pill, ScreenHeader, StatGrid, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";
import { WEBHOOK_EVENTS } from "@/lib/webhook-delivery";

export const metadata: Metadata = { title: "Webhooks" };
export const dynamic = "force-dynamic";

const EVENTS = WEBHOOK_EVENTS.filter((e) => e !== "webhook.test");

export default async function WebhooksPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const view = tab === "logs" ? "logs" : "endpoints";
  const c = await settingsContext();
  let reachable = Boolean(c);
  let hooks: { id: string; url: string; events: string[]; status: string; last: Date | null }[] = [];
  let deliveries: { id: string; url: string; event: string; code: number | null; latency: number | null; attempts: number; at: Date }[] = [];
  let totals = { deliveries: 0, failures: 0 };
  if (c) {
    try {
      const rows = await db.webhook.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, include: { deliveries: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } } } });
      hooks = rows.map((w) => ({ id: w.id, url: w.url, events: w.events, status: w.status, last: w.deliveries[0]?.createdAt ?? null }));
      const ids = rows.map((w) => w.id);
      const [recent, all, failed] = await Promise.all([
        db.webhookDelivery.findMany({ where: { webhookId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 100, include: { webhook: { select: { url: true } } } }),
        db.webhookDelivery.count({ where: { webhookId: { in: ids } } }),
        db.webhookDelivery.count({ where: { webhookId: { in: ids }, OR: [{ responseCode: null }, { responseCode: { lt: 200 } }, { responseCode: { gte: 300 } }] } }),
      ]);
      deliveries = recent.map((d) => ({ id: d.id, url: d.webhook.url, event: d.event, code: d.responseCode, latency: d.latencyMs, attempts: d.attempts, at: d.createdAt }));
      totals = { deliveries: all, failures: failed };
    } catch {
      reachable = false;
    }
  }
  const canEdit = Boolean(c?.isAdmin);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Integrations", "/app/integrations"], ["Webhooks"]]}
        title="Webhooks"
        subtitle="Create, monitor, and troubleshoot outbound webhook endpoints."
        actions={<CreateWebhookButton events={EVENTS} canEdit={canEdit} />}
      />
      <StatGrid
        stats={[
          { label: "Endpoints", icon: Webhook, value: hooks.length ? fmtInt(hooks.length) : null },
          { label: "Active", icon: Check, value: hooks.length ? fmtInt(hooks.filter((h) => h.status === "active").length) : null },
          { label: "Deliveries", icon: ArrowUpRight, value: totals.deliveries ? fmtInt(totals.deliveries) : null },
          { label: "Failures", icon: AlertCircle, value: totals.deliveries ? fmtInt(totals.failures) : null },
        ]}
      />
      <nav aria-label="Webhook views" className="mb-4 flex gap-10 px-4">
        {[["endpoints", "Endpoints"], ["logs", "Delivery Logs"]].map(([k, l]) => (
          <Link key={k} href={k === "endpoints" ? "/app/integrations/webhooks" : "/app/integrations/webhooks?tab=logs"} className={cn("pb-2 text-[15px]", view === k ? "border-b-[3px] border-[#0B5CFF] font-semibold text-[#0B5CFF]" : "text-deep-navy")}>{l}</Link>
        ))}
      </nav>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_1fr]">
        <section className="min-h-[560px] rounded-xl border border-line bg-white p-5">
          {view === "endpoints" ? (
            <DataTable
              minWidth={760}
              columns={["Endpoint", "Subscribed Events", "Status", "Last Delivery", "Actions"]}
              rows={hooks.map((h) => [<span key="u" className="break-all">{h.url}</span>, h.events.join(", "), <Pill key="s" tone={h.status === "active" ? "green" : "gray"}>{h.status}</Pill>, h.last ? fmtDateTime(h.last) : "Never", <WebhookRowActions key="a" id={h.id} status={h.status} canEdit={canEdit} />])}
              empty={<EmptyState icon={Webhook} title={reachable ? "No webhook endpoints yet" : "Webhooks unavailable"} body="Create an endpoint to subscribe to supported events." action={reachable ? <CreateWebhookButton events={EVENTS} canEdit={canEdit} /> : undefined} />}
            />
          ) : (
            <DataTable
              minWidth={760}
              columns={["Time", "Endpoint", "Event", "Response", "Latency", "Attempts"]}
              rows={deliveries.map((d) => [fmtDateTime(d.at), <span key="u" className="break-all">{d.url}</span>, d.event, <Pill key="r" tone={d.code && d.code >= 200 && d.code < 300 ? "green" : "red"}>{d.code ? String(d.code) : d.attempts === 0 ? "Blocked" : "No response"}</Pill>, d.latency != null ? `${d.latency} ms` : "—", String(d.attempts)])}
              empty={<EmptyState icon={ArrowUpRight} title="No deliveries yet" body="Response code, latency, and delivery details appear after delivery attempts exist." />}
            />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Webhook Controls</h2>
          <InfoList
            rows={[
              { title: "Delivery logs", body: "Response code, latency, and delivery details appear after delivery attempts exist." },
              { title: "Retry policy", body: "Each delivery is attempted up to 3 times with backoff; non-public or non-https endpoints are blocked." },
              { title: "Signing secret", body: "Secrets are shown once at creation and stay masked; verify the x-amplivanta-signature header (HMAC-SHA256)." },
              { title: "Endpoint test", body: "Use Test on an endpoint to send a signed webhook.test event." },
              { title: "Supported events", body: EVENTS.join(", ") },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
