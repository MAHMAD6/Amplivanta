import type { Metadata } from "next";
import Link from "next/link";
import { Braces, CalendarDays, Plug, ShieldCheck, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, Panel, Pill, ScreenHeader, fmtDate, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary, outlineSm, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createEvent, deleteEvent, importEventSchema, validateEvent } from "@/app/(app)/app/marketing/actions";
import { marketingContext, triggerLabel } from "@/lib/server/marketing-screens";
import { EVENT_SOURCES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Trigger / Event Manager" };
export const dynamic = "force-dynamic";

const BUILT_IN = [["contact.created", "CRM"], ["form.submitted", "Forms"], ["deal.won", "CRM"], ["tag.added", "CRM"]];

export default async function TriggerManagerPage({ searchParams }: { searchParams: Promise<{ event?: string; docs?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  let events: { id: string; name: string; description: string | null; source: string; properties: unknown; validationStatus: string | null; validatedAt: Date | null; updatedAt: Date }[] = [];
  let flows: { id: string; name: string; trigger: string | null; status: string }[] = [];
  let counts: { eventName: string; count: number }[] = [];
  let integrations = 0;
  if (c) {
    try {
      const w = c.workspaceId;
      [events, flows, counts, integrations] = await Promise.all([
        db.eventDefinition.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, description: true, source: true, properties: true, validationStatus: true, validatedAt: true, updatedAt: true } }),
        db.workflow.findMany({ where: { workspaceId: w, trigger: { not: null } }, select: { id: true, name: true, trigger: true, status: true } }),
        db.dailyEventAggregate.groupBy({ by: ["eventName"], where: { workspaceId: w, date: { gte: new Date(Date.now() - 30 * 86400000) } }, _sum: { count: true } }).then((r) => r.map((x) => ({ eventName: x.eventName, count: x._sum.count ?? 0 }))),
        db.integration.count({ where: { workspaceId: w, status: "connected" } }),
      ]);
    } catch {
      events = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const selected = events.find((e) => e.id === sp.event);
  const usage = (name: string) => flows.filter((f) => f.trigger === `event:${name}`);
  const bySource = EVENT_SOURCES.map(([k, l]): [string, number] => [l, events.filter((e) => e.source === k).length]).filter(([, n]) => n > 0);
  const triggerUse = [...new Set(flows.map((f) => f.trigger!))].map((t): [string, number] => [triggerLabel(t), flows.filter((f) => f.trigger === t).length]);
  const passed = events.filter((e) => e.validationStatus === "passed").length;
  const failed = events.filter((e) => e.validationStatus === "failed").length;

  const create = (cls: string, text = "+ Create Event") => <FormDialog title="Create Event" label={text} className={cls} action={createEvent} disabled={!canEdit} submitLabel="Create event" fields={[{ name: "name", label: "Event name", kind: "text", required: true, placeholder: "trial.started" }, { name: "source", label: "Source", kind: "select", options: EVENT_SOURCES, defaultValue: "custom" }, { name: "description", label: "Description", kind: "text" }, { name: "payload", label: "Sample payload (JSON)", kind: "textarea", rows: 5, placeholder: '{ "contactId": "…", "plan": "pro" }' }]} />;
  const importDialog = (cls: string) => <FormDialog title="Import Schema" label="Import Schema" className={cls} action={importEventSchema} disabled={!canEdit} submitLabel="Import" note='JSON array, e.g. [{ "name": "trial.started", "description": "…", "source": "custom", "payload": { "plan": "pro" } }]. Existing names are skipped.' fields={[{ name: "schema", label: "Event schema JSON", kind: "textarea", rows: 10, required: true }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Trigger / Event Manager"]]}
        title="Trigger / Event Manager"
        subtitle="Define events and connect them to automations when your workspace is ready."
        actions={<><Link href="?docs=1#docs" className={headerOutline}>View Documentation</Link>{importDialog(headerOutline)}{create(headerPrimary)}</>}
      />
      {(sp.docs || !events.length) && (
        <Panel className="mb-4" id="docs">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <h2 className="text-[20px] font-semibold text-deep-navy">{events.length ? "Sending events" : "No event definitions yet"}</h2>
              <p className="mt-1 text-[13.5px] text-ink-soft">Create your first event to start capturing important business moments. Built-in triggers (contact created, form submitted, deal won) fire automatically.</p>
              <ul className="mt-3 space-y-2 text-[13px] text-deep-navy">
                <li><b>Define custom events</b> — name and describe events that match your business.</li>
                <li><b>Connect to sources</b> — send events from your systems with a workspace API key.</li>
                <li><b>Trigger automations</b> — choose “Event: name” as a workflow trigger.</li>
              </ul>
              {!events.length && <div className="mt-4 flex gap-2">{create(primarySm, "Create Event")}{importDialog(outlineSm)}</div>}
            </div>
            <pre className="overflow-x-auto rounded-lg bg-[#0B1B3F] p-4 text-[12px] leading-relaxed text-white">{`POST /api/analytics-events
Authorization: Bearer amp_<workspace API key>
Content-Type: application/json

{ "name": "trial.started",
  "properties": { "contactId": "<CRM contact id>" } }`}</pre>
          </div>
          <p className="mt-3 text-[12px] text-ink-muted">Create API keys in <Link href="/app/integrations/api-keys" className="text-[#0B5CFF]">Integrations</Link>. Include a contactId so workflows can email or tag that contact. Unknown event names are registered automatically.</p>
        </Panel>
      )}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Configured Events">
          {events.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Event Name", "Source", "Usage", "Validation", "Last Updated", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className={cn("border-b border-line last:border-0", selected?.id === e.id && "bg-royal-tint/30")}>
                      <td className="px-3 py-2.5"><Link href={`?event=${e.id}`} className="font-mono font-semibold text-deep-navy hover:text-[#0B5CFF]">{e.name}</Link>{e.description && <div className="text-[11.5px] text-ink-muted">{e.description}</div>}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{label(EVENT_SOURCES, e.source)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{usage(e.name).length} workflow{usage(e.name).length === 1 ? "" : "s"} · {counts.find((x) => x.eventName === e.name)?.count ?? 0} in 30d</td>
                      <td className="px-3 py-2.5">{e.validationStatus ? <Pill tone={e.validationStatus === "passed" ? "green" : "red"}>{e.validationStatus}</Pill> : <span className="text-ink-muted">Not run</span>}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{fmtDate(e.updatedAt)}</td>
                      <td className="px-3 py-2.5">{canEdit && <span className="flex gap-1.5"><ActButton action={validateEvent.bind(null, e.id)}>Validate</ActButton><ActButton action={deleteEvent.bind(null, e.id)} confirm="Delete this event definition?">Delete</ActButton></span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="No events configured yet" body="Create or import an event to get started." action={<span className="flex gap-2">{create(primarySm, "Create Event")}{importDialog(outlineSm)}</span>} />
          )}
        </Panel>
        <Panel title="Event Schema / Payload Preview">
          {selected ? (
            <>
              <p className="mb-2 font-mono text-[13px] font-semibold text-deep-navy">{selected.name}</p>
              <pre className="max-h-[320px] overflow-auto rounded-lg bg-bg-soft p-3 text-[12px] text-deep-navy">{selected.properties ? JSON.stringify(selected.properties, null, 2) : "No sample payload"}</pre>
              <p className="mt-2 text-[12px] text-ink-muted">Used by: {usage(selected.name).map((f) => f.name).join(", ") || "no workflows yet"}</p>
            </>
          ) : (
            <EmptyState icon={Braces} title="No schema selected" body="Choose an event to preview its schema and payload structure." />
          )}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Connected Sources">
          {bySource.length || integrations ? (
            <>
              <BarList rows={[...BUILT_IN.map(([n, s]): [string, number] => [`${s}: ${n}`, flows.filter((f) => f.trigger === n).length]).filter(([, v]) => v > 0), ...bySource]} />
              <p className="mt-3 text-[12px] text-ink-muted">{integrations} connected integration{integrations === 1 ? "" : "s"} in this workspace.</p>
            </>
          ) : (
            <EmptyState icon={Plug} title="No sources connected" body="Connect a source to start receiving events." action={<Link href="/app/integrations" className={outlineSm}>Manage Sources</Link>} />
          )}
        </Panel>
        <Panel title="Trigger Usage">
          {triggerUse.length ? <BarList rows={triggerUse} /> : <EmptyState icon={Zap} title="No workflows yet" body="Events will appear here once they are used in workflows." action={<Link href="/app/marketing/workflows" className={outlineSm}>Open Workflow Builder</Link>} />}
        </Panel>
        <Panel title="Validation">
          {passed || failed ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Passed</span><b className="text-emerald-700">{passed}</b></li>
              <li className="flex justify-between"><span>Failed</span><b className="text-red-600">{failed}</b></li>
              <li className="flex justify-between"><span>Not validated</span><b>{events.length - passed - failed}</b></li>
              <li className="text-[12px] text-ink-muted">Last run {fmtDateTime(events.map((e) => e.validatedAt).filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0])}</li>
            </ul>
          ) : (
            <EmptyState icon={ShieldCheck} title="No validation has run" body="Validation checks each event's name and sample payload. Use Validate on an event." />
          )}
        </Panel>
      </div>
    </div>
  );
}
