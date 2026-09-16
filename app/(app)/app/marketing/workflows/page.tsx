import type { Metadata } from "next";
import Link from "next/link";
import { History, Workflow as WorkflowIcon } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, KeyList, Panel, Pill, ScreenHeader, TabBar, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { WorkflowBuilder } from "@/components/amplivanta/marketing-builders";
import { createWorkflow, deleteWorkflow, publishWorkflow, restoreWorkflowVersion, runWorkflowForContact, saveWorkflowAsTemplate, saveWorkflowDraft, setWorkflowStatus, testWorkflow } from "@/app/(app)/app/marketing/actions";
import { marketingContext, triggerLabel, triggerOptions } from "@/lib/server/marketing-screens";
import { nodesFor } from "@/lib/workflow-engine";
import { WORKFLOW_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Workflow Builder" };
export const dynamic = "force-dynamic";

type SP = { id?: string; tab?: string };
const TONE: Record<string, "green" | "amber" | "gray" | "red" | "blue"> = { active: "green", inactive: "amber", draft: "gray", completed: "green", failed: "red", waiting: "blue", running: "blue", pending: "gray" };

export default async function WorkflowBuilderPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  let flows: { id: string; name: string; status: string; version: number; trigger: string | null; updatedAt: Date }[] = [];
  let triggers: [string, string][] = [];
  let segments: [string, string][] = [];
  let contacts: [string, string][] = [];
  let wf: Awaited<ReturnType<typeof db.workflow.findFirst>> = null;
  let nodes: Awaited<ReturnType<typeof nodesFor>> = [];
  let versions: { version: number; createdAt: Date }[] = [];
  let runs: { id: string; status: string; environment: string; startedAt: Date; error: string | null; attempt: number }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      [flows, triggers, segments, contacts] = await Promise.all([
        db.workflow.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, status: true, version: true, trigger: true, updatedAt: true } }),
        triggerOptions(w),
        db.segment.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }).then((r) => r.map((s): [string, string] => [s.id, s.name])),
        db.contact.findMany({ where: { workspaceId: w, email: { not: null } }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, email: true, name: true } }).then((r) => r.map((x): [string, string] => [x.id, x.name ? `${x.name} (${x.email})` : x.email!])),
      ]);
      const id = sp.id ?? flows[0]?.id;
      if (id) {
        wf = await db.workflow.findFirst({ where: { id, workspaceId: w } });
        if (wf) {
          [nodes, versions, runs] = await Promise.all([
            nodesFor(wf.id, null),
            db.workflowVersion.findMany({ where: { workflowId: wf.id }, orderBy: { version: "desc" }, take: 20, select: { version: true, createdAt: true } }),
            db.workflowExecution.findMany({ where: { workflowId: wf.id, environment: sp.tab === "live" ? "live" : "test" }, orderBy: { startedAt: "desc" }, take: 15, select: { id: true, status: true, environment: true, startedAt: true, error: true, attempt: true } }),
          ]);
        }
      }
    } catch {
      wf = null;
    }
  }
  const tab = sp.tab === "test" || sp.tab === "live" ? sp.tab : "draft";
  const newWorkflow = (cls: string, text = "+ New Workflow") => <FormDialog title="New Workflow" label={text} className={cls} action={createWorkflow} disabled={!canEdit} goTo="/app/marketing/workflows?id=" submitLabel="Create draft" fields={[{ name: "name", label: "Workflow name", kind: "text", required: true }, { name: "trigger", label: "Trigger", kind: "select", options: triggers, placeholder: "Choose in the builder" }, { name: "description", label: "Description", kind: "textarea", rows: 2 }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Workflow Builder"]]}
        title="Workflow Builder"
        actions={<>{newWorkflow(headerOutline)}<Link href="/app/marketing/templates" className={headerOutline}>Templates</Link>{wf && <Link href={`/app/marketing/execution-logs?workflow=${wf.id}`} className={headerOutline}>Execution Logs</Link>}</>}
      />
      {flows.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
          <label htmlFor="wf" className="px-2 text-[12.5px] font-semibold text-deep-navy">Workflow</label>
          <select id="wf" name="id" defaultValue={wf?.id} className="h-9 min-w-[240px] rounded-md border border-line bg-white px-2.5 text-[12.5px]">
            {flows.map((f) => <option key={f.id} value={f.id}>{f.name} · {label(WORKFLOW_STATUSES, f.status)}{f.version ? ` · v${f.version}` : ""}</option>)}
          </select>
          <button className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold">Open</button>
          {wf && (
            <span className="ml-auto flex flex-wrap items-center gap-2 text-[12.5px]">
              <Pill tone={TONE[wf.status] ?? "gray"}>{label(WORKFLOW_STATUSES, wf.status)}</Pill>
              <span className="text-ink-soft">{wf.version ? `Live version ${wf.version}` : "Never published"}</span>
              {canEdit && wf.version > 0 && (wf.status === "active" ? <ActButton action={setWorkflowStatus.bind(null, wf.id, "inactive")}>Pause</ActButton> : <ActButton action={setWorkflowStatus.bind(null, wf.id, "active")}>Activate</ActButton>)}
              {canEdit && <ActButton action={saveWorkflowAsTemplate.bind(null, wf.id)}>Save as Template</ActButton>}
              {canEdit && <ActButton action={deleteWorkflow.bind(null, wf.id)} confirm="Delete this workflow and its run history?">Delete</ActButton>}
            </span>
          )}
        </form>
      )}
      {!wf ? (
        <Panel>
          <EmptyState icon={WorkflowIcon} title="Add a trigger to begin" body="Create a workflow, then choose a trigger and add nodes to automate follow-ups, tagging and webhooks." action={<span className="flex gap-2">{newWorkflow(headerPrimary, "New Workflow")}<Link href="/app/marketing/templates" className={outlineSm}>Start from a template</Link></span>} />
        </Panel>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <TabBar active={tab === "draft" ? "Draft" : tab === "test" ? "Test" : "Live"} tabs={[["Draft", `?id=${wf.id}`], ["Test", `?id=${wf.id}&tab=test`], ["Live", `?id=${wf.id}&tab=live`]]} />
            <span className="text-[12.5px] text-ink-soft">Created {fmtDateTime(wf.createdAt)} · Last updated {fmtDateTime(wf.updatedAt)}</span>
          </div>
          {tab === "draft" ? (
            <WorkflowBuilder
              key={`${wf.id}-${wf.updatedAt.getTime()}`}
              workflow={{ id: wf.id, name: wf.name, segmentId: wf.segmentId ?? "", goal: wf.goal ?? "", maxRetries: wf.maxRetries, nodes }}
              triggers={triggers}
              segments={segments}
              contacts={contacts}
              canEdit={canEdit}
              saveDraft={saveWorkflowDraft}
              publish={publishWorkflow}
              test={testWorkflow}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Panel title={tab === "test" ? "Test Runs" : "Live Runs"} subtitle={tab === "test" ? "Test runs use the draft and never send emails or webhooks." : `Runs of the published version. Trigger: ${triggerLabel(wf.trigger)}.`}>
                {runs.length ? (
                  <ul className="divide-y divide-line">
                    {runs.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
                        <span><Link href={`/app/marketing/execution-logs?run=${r.id}`} className="font-mono text-[12px] text-[#0B5CFF]">{r.id.slice(-8)}</Link> <span className="text-ink-soft">· {fmtDateTime(r.startedAt)}{r.attempt > 1 ? ` · attempt ${r.attempt}` : ""}</span>{r.error && <span className="block text-[12px] text-red-600">{r.error}</span>}</span>
                        <Pill tone={TONE[r.status] ?? "gray"}>{r.status}</Pill>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={WorkflowIcon} title={tab === "test" ? "No test runs yet" : "No live runs yet"} body={tab === "test" ? "Use Test in the Draft tab to run the workflow safely." : "Live runs start when the trigger fires on an active, published workflow."} />
                )}
              </Panel>
              {tab === "live" && (
                <Panel title="Run for a contact" subtitle="Starts a live run of the published version now.">
                  <FormDialog title="Run workflow" label="Run for contact" className={outlineSm} action={runWorkflowForContact} disabled={!canEdit || wf.status !== "active"} submitLabel="Start run" note="Emails and webhooks in this workflow will be sent for real." fields={[{ name: "workflowId", kind: "hidden", value: wf.id }, { name: "contactId", label: "Contact", kind: "select", options: contacts, required: true }]} />
                  {wf.status !== "active" && <p className="mt-2 text-[12px] text-ink-muted">Publish and activate the workflow to run it live.</p>}
                </Panel>
              )}
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel title="Version history" action={<History className="h-4 w-4 text-ink-muted" />}>
              {versions.length ? (
                <ul className="divide-y divide-line">
                  {versions.map((v) => (
                    <li key={v.version} className="flex items-center justify-between py-2 text-[13px]">
                      <span className={cn("font-semibold", v.version === wf!.version ? "text-emerald-700" : "text-deep-navy")}>Version {v.version}{v.version === wf!.version ? " · live" : ""}<span className="ml-2 font-normal text-ink-muted">{fmtDateTime(v.createdAt)}</span></span>
                      {canEdit && <ActButton action={restoreWorkflowVersion.bind(null, wf!.id, v.version)} confirm="Replace the current draft with this version?">Restore to draft</ActButton>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-ink-soft">No versions yet. Publishing creates a version snapshot.</p>
              )}
            </Panel>
            <Panel title="Workflow details">
              <KeyList rows={[["Trigger", triggerLabel(wf.trigger)], ["Status", label(WORKFLOW_STATUSES, wf.status)], ["Workflow version", wf.version ? `v${wf.version}` : "Draft"], ["Published", fmtDateTime(wf.publishedAt)], ["Retries on failure", String(wf.maxRetries)]]} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
