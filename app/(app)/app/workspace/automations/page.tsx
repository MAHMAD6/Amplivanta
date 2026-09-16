import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { db } from "@/lib/db";
import { DataTable, EmptyState, ScreenHeader, TabBar, fmtDate, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { StatusSelect } from "@/components/amplivanta/workspace-ui";
import { createAutomation } from "@/app/(app)/app/workspace/actions";
import { WORKFLOW_STATUSES, WORKFLOW_TRIGGERS, label } from "@/lib/workspace/options";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Automations" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/automations";

export default async function AutomationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const status = WORKFLOW_STATUSES.some(([v]) => v === tab) ? tab! : null;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let rows: { id: string; name: string; trigger: string | null; status: string; steps: number; runs: number; lastRun: Date | null; updatedAt: Date }[] = [];
  if (c) {
    try {
      const wfs = await db.workflow.findMany({
        where: { workspaceId: c.workspaceId, ...(status ? { status } : {}) },
        orderBy: { updatedAt: "desc" },
        take: 200,
        include: { _count: { select: { nodes: true, executions: true } }, executions: { orderBy: { startedAt: "desc" }, take: 1, select: { startedAt: true } } },
      });
      rows = wfs.map((w) => ({ id: w.id, name: w.name, trigger: w.trigger, status: w.status, steps: w._count.nodes, runs: w._count.executions, lastRun: w.executions[0]?.startedAt ?? null, updatedAt: w.updatedAt }));
    } catch {
      reachable = false;
    }
  }
  const create = (text: string) => (
    <FormDialog
      title="New Automation"
      label={<><Plus className="h-4 w-4" /> {text}</>}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50"
      action={createAutomation}
      disabled={!c?.canEdit}
      submitLabel="Create draft"
      note="Automations start as drafts. Add steps in the Workflow Builder, then activate."
      fields={[
        { name: "name", label: "Name", kind: "text", required: true },
        { name: "trigger", label: "Trigger", kind: "select", options: WORKFLOW_TRIGGERS, placeholder: "Choose later" },
        { name: "description", label: "Description", kind: "textarea", rows: 3 },
      ]}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Automations"]]} title="Automations" subtitle="Set up and manage automations." actions={create("New Automation")} />
      <TabBar active={status ? `${BASE}?tab=${status}` : BASE} tabs={[["All Automations", BASE], ...WORKFLOW_STATUSES.map(([v, l]) => [l === "Draft" ? "Drafts" : l, `${BASE}?tab=${v}`] as [string, string])]} />
      <section className="mb-5 min-h-[440px] rounded-xl border border-line bg-white p-5">
        <DataTable
          minWidth={860}
          columns={["Automation", "Trigger", "Steps", "Runs", "Last run", "Updated", "Status"]}
          rows={rows.map((r) => [
            <Link key="n" href="/app/marketing/workflows" className="hover:text-[#0B5CFF]">{r.name}</Link>,
            r.trigger ? label(WORKFLOW_TRIGGERS, r.trigger) : "Not set",
            String(r.steps),
            String(r.runs),
            r.lastRun ? fmtDateTime(r.lastRun) : "Never",
            fmtDate(r.updatedAt),
            <StatusSelect key="s" kind="automation" id={r.id} value={r.status} options={WORKFLOW_STATUSES.some(([v]) => v === r.status) ? WORKFLOW_STATUSES : [[r.status, r.status], ...WORKFLOW_STATUSES]} canEdit={Boolean(c?.canEdit)} />,
          ])}
          empty={<EmptyState icon={Settings} title={reachable ? (status ? "No automations here" : "No automations yet") : "Automations unavailable"} body="Set up and manage automations." action={reachable && !status ? create("Create Automation") : undefined} />}
        />
      </section>
      <section className="rounded-xl border border-line bg-bg-soft/50 px-10 py-10">
        <h2 className="text-[22px] font-semibold text-deep-navy">Automate. Streamline. Scale.</h2>
        <p className="mt-2 text-[15px] text-ink-soft">Use automations to trigger actions, send notifications, update data, and more.</p>
      </section>
    </div>
  );
}
