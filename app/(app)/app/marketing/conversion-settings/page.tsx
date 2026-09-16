import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarDays, CheckCircle2, Circle, Flag, Link2, Scale, ShieldCheck, Target } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Panel, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton, ActionForm, SubmitButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { runConversionValidation, saveConversionSection, type ConversionSettings } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";
import { ATTRIBUTION_MODELS, LOOKBACK_WINDOWS, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Conversion Settings" };
export const dynamic = "force-dynamic";

const BUILT_IN: [string, string][] = [["form.submitted", "Form submitted"], ["contact.created", "Contact created"], ["deal.won", "Deal won"]];

function Card({ icon: Icon, tone, title, status, body, children }: { icon: typeof Target; tone: string; title: string; status: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <Panel title={title}>
      <div className="flex gap-4">
        <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full", tone)}><Icon className="h-7 w-7" /></span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-deep-navy">{status}</h3>
          <div className="mt-1 text-[13px] text-ink-soft">{body}</div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </Panel>
  );
}

export default async function ConversionSettingsPage() {
  const c = await marketingContext();
  let s: ConversionSettings = {};
  let events: [string, string][] = BUILT_IN;
  let sources = { integrations: 0, forms: 0, pages: 0 };
  if (c) {
    try {
      const w = c.workspaceId;
      const [p, defs, integrations, forms, pages] = await Promise.all([
        db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId: w, scope: "conversion" } } }),
        db.eventDefinition.findMany({ where: { workspaceId: w }, select: { name: true }, orderBy: { name: "asc" } }),
        db.integration.count({ where: { workspaceId: w, status: "connected" } }),
        db.form.count({ where: { workspaceId: w, status: "active" } }),
        db.landingPage.count({ where: { workspaceId: w, status: "published", analyticsEnabled: true } }),
      ]);
      s = (p?.values ?? {}) as ConversionSettings;
      events = [...BUILT_IN, ...defs.map((d): [string, string] => [d.name, d.name])];
      sources = { integrations, forms, pages };
    } catch {
      s = {};
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const evLabel = (v: string) => events.find(([k]) => k === v)?.[1] ?? v;
  const hasSources = sources.integrations + sources.forms + sources.pages > 0;
  const checklist: [string, string, boolean][] = [
    ["Add primary conversion goal", "Define your main business conversion", Boolean(s.primaryGoal)],
    ["Add secondary goals", "Track additional valuable actions", Boolean(s.secondaryGoals?.length)],
    ["Configure event tracking", "Set up events to capture user actions", Boolean(s.trackedEvents?.length)],
    ["Set attribution rules", "Define how credit is assigned", Boolean(s.attributionModel)],
    ["Set default lookback window", "Choose the attribution time window", Boolean(s.lookbackDays)],
    ["Connect tracking sources", "Connect your data sources", hasSources],
    ["Run validation", "Validate your tracking setup", Boolean(s.validation?.passed)],
  ];
  const goalFields = (section: string, withValue: boolean) => [
    { name: "section", kind: "hidden" as const, value: section },
    { name: "name", label: "Goal name", kind: "text" as const, required: true, placeholder: "Demo request" },
    { name: "event", label: "Conversion event", kind: "select" as const, options: events, required: true },
    ...(withValue ? [{ name: "value", label: "Value per conversion (USD, optional)", kind: "number" as const }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Conversion Settings"]]} title="Conversion Settings" subtitle="Define goals, events, and attribution rules when your workspace is ready." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card icon={Target} tone="bg-violet/10 text-violet" title="Primary Conversion Goal" status={s.primaryGoal ? s.primaryGoal.name : "Not configured"} body={s.primaryGoal ? `Event: ${evLabel(s.primaryGoal.event)}${s.primaryGoal.value != null ? ` · $${s.primaryGoal.value} per conversion` : ""}` : "Define the primary conversion your business cares about most."}>
            <FormDialog title="Primary Conversion Goal" label={s.primaryGoal ? "Edit Goal" : "Add Conversion Goal"} className={outlineSm} action={saveConversionSection} disabled={!canEdit} fields={goalFields("primary", true)} />
          </Card>
          <Card icon={Flag} tone="bg-emerald-50 text-emerald-600" title="Secondary Goals" status={s.secondaryGoals?.length ? `${s.secondaryGoals.length} goal${s.secondaryGoals.length === 1 ? "" : "s"}` : "Not configured"} body={s.secondaryGoals?.length ? <ul className="space-y-1">{s.secondaryGoals.map((g) => <li key={g.event} className="flex items-center justify-between gap-2"><span>{g.name} · {evLabel(g.event)}</span>{canEdit && <RemoveSecondary event={g.event} />}</li>)}</ul> : "Add secondary conversions to track additional valuable actions."}>
            <FormDialog title="Add Secondary Goal" label="Add Secondary Goal" className={outlineSm} action={saveConversionSection} disabled={!canEdit} fields={goalFields("secondary", false)} />
          </Card>
          <Card icon={Activity} tone="bg-royal-tint text-[#0B5CFF]" title="Event Tracking" status={s.trackedEvents?.length ? `${s.trackedEvents.length} event${s.trackedEvents.length === 1 ? "" : "s"} tracked` : "Not configured"} body={s.trackedEvents?.length ? s.trackedEvents.map(evLabel).join(", ") : "Set up and manage events to capture meaningful user actions."}>
            <ActionForm action={saveConversionSection} className="space-y-2">
              <input type="hidden" name="section" value="events" />
              <div className="flex flex-wrap gap-x-3 gap-y-1">{events.map(([v, l]) => <label key={v} className="flex items-center gap-1.5 text-[12.5px] text-deep-navy"><input type="checkbox" name="events" value={v} defaultChecked={s.trackedEvents?.includes(v)} disabled={!canEdit} />{l}</label>)}</div>
              <div className="flex gap-2"><SubmitButton>Configure Events</SubmitButton><Link href="/app/marketing/triggers" className={outlineSm}>Manage events</Link></div>
            </ActionForm>
          </Card>
          <Card icon={Scale} tone="bg-orange-50 text-orange-500" title="Attribution Rules" status={s.attributionModel ? label(ATTRIBUTION_MODELS, s.attributionModel) : "Not configured"} body="Define how credit is assigned across touchpoints and channels.">
            <ActionForm action={saveConversionSection} className="flex flex-wrap gap-2">
              <input type="hidden" name="section" value="attribution" />
              <select name="model" defaultValue={s.attributionModel ?? ""} disabled={!canEdit} aria-label="Attribution model" className="h-9 rounded-md border border-line bg-white px-2 text-[12.5px]"><option value="">Choose model</option>{ATTRIBUTION_MODELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <SubmitButton>Configure Attribution</SubmitButton>
            </ActionForm>
          </Card>
          <Card icon={CalendarDays} tone="bg-royal-tint text-[#0B5CFF]" title="Default Lookback Window" status={s.lookbackDays ? `${s.lookbackDays} days` : "Not configured"} body="Set the default time window for attributing conversions to touchpoints.">
            <ActionForm action={saveConversionSection} className="flex flex-wrap gap-2">
              <input type="hidden" name="section" value="lookback" />
              <select name="days" defaultValue={s.lookbackDays ? String(s.lookbackDays) : ""} disabled={!canEdit} aria-label="Lookback window" className="h-9 rounded-md border border-line bg-white px-2 text-[12.5px]"><option value="">Choose window</option>{LOOKBACK_WINDOWS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <SubmitButton>Set Lookback Window</SubmitButton>
            </ActionForm>
          </Card>
          <Card icon={Link2} tone="bg-emerald-50 text-emerald-600" title="Connected Tracking Sources" status={hasSources ? "Sources sending data" : "No sources connected"} body={hasSources ? `${sources.forms} active form${sources.forms === 1 ? "" : "s"} · ${sources.pages} tracked page${sources.pages === 1 ? "" : "s"} · ${sources.integrations} integration${sources.integrations === 1 ? "" : "s"}` : "Connect your data sources to enable conversion tracking."}>
            <Link href="/app/integrations" className={outlineSm}>Connect Sources</Link>
          </Card>
          <div className="lg:col-span-2">
            <Card icon={ShieldCheck} tone="bg-violet/10 text-violet" title="Validation" status={s.validation ? (s.validation.passed ? "Setup is valid" : `${s.validation.issues.length} issue${s.validation.issues.length === 1 ? "" : "s"} found`) : "No validation run yet"} body={s.validation ? <>Last run {new Date(s.validation.ranAt).toLocaleString("en-US")}{s.validation.issues.length > 0 && <ul className="mt-1 list-disc pl-5 text-red-700">{s.validation.issues.map((i) => <li key={i}>{i}</li>)}</ul>}</> : "Run validation to ensure your tracking setup is accurate and working as expected."}>
              <ActButton action={runConversionValidation} disabled={!canEdit} className="h-9 px-4 text-[#0B5CFF]">Run Validation</ActButton>
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          <Panel title="Setup Checklist" subtitle="Complete these required items to enable conversion tracking and attribution.">
            <ul className="space-y-3">
              {checklist.map(([t, b, done]) => (
                <li key={t} className="flex gap-3">
                  {done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />}
                  <span><span className="block text-[13.5px] font-semibold text-deep-navy">{t}</span><span className="text-[12.5px] text-ink-soft">{b}</span></span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Need help getting started?">
            <p className="text-[13px] text-ink-soft">Define events in the Trigger / Event Manager, then pick one as your primary goal. Form submissions and won deals are tracked automatically.</p>
            <Link href="/app/marketing/triggers?docs=1#docs" className={cn(outlineSm, "mt-3")}>View Setup Guide</Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RemoveSecondary({ event }: { event: string }) {
  return (
    <ActionForm action={saveConversionSection}>
      <input type="hidden" name="section" value="removeSecondary" />
      <input type="hidden" name="event" value={event} />
      <button type="submit" className="text-[12px] font-semibold text-red-600">Remove</button>
    </ActionForm>
  );
}
