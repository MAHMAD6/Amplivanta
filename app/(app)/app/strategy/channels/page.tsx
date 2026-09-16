import type { Metadata } from "next";
import { CircleDot } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, KeyList, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { MetricCards, PanelTitle, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog, type FieldSpec } from "@/components/amplivanta/creative-ui";
import { deleteChannelPlan, reviewChannelPlan, saveChannelPlan, submitChannelPlan } from "@/app/(app)/app/strategy/actions";
import { growthContext, memberNames, money } from "@/lib/server/growth-screens";
import { APPROVAL_STATUSES, PLAN_CHANNELS, SCENARIOS, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Channel Plan & Budget" };
export const dynamic = "force-dynamic";

type Plan = Awaited<ReturnType<typeof db.channelPlan.findMany>>[number];

export default async function ChannelPlanPage() {
  const c = await growthContext();
  let plans: Plan[] = [];
  let actual: number | null = null;
  let members: { id: string; name: string }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const [p, spend, m] = await Promise.all([
        db.channelPlan.findMany({ where: { workspaceId: w }, orderBy: { budget: "desc" } }),
        db.campaign.aggregate({ where: { workspaceId: w }, _sum: { spend: true } }),
        memberNames(w),
      ]);
      plans = p;
      actual = spend._sum.spend || null;
      members = m;
    } catch {
      plans = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const has = plans.length > 0;
  const total = (k: "budget" | "plannedSpend" | "expectedReturn" | "targetLeads" | "targetRevenue") => {
    const vals = plans.map((p) => p[k]).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  const budget = total("budget");
  const planned = total("plannedSpend");
  const ret = total("expectedReturn");
  const statuses = new Set(plans.map((p) => p.approvalStatus));
  const approval = !has ? "not_submitted" : statuses.has("pending") ? "pending" : statuses.has("changes_requested") ? "changes_requested" : statuses.size === 1 && statuses.has("approved") ? "approved" : "not_submitted";
  const approverId = plans.find((p) => p.approvedById)?.approvedById;
  const scenarios = [...new Set(plans.map((p) => p.scenario))];
  const locked = plans.filter((p) => p.approvalStatus === "approved").length;

  const fields = (p?: Plan): FieldSpec[] => [
    ...(p ? [{ name: "id", kind: "hidden", value: p.id } as FieldSpec] : []),
    { name: "channel", label: "Channel", kind: "select", options: PLAN_CHANNELS, required: true, defaultValue: p?.channel },
    { name: "scenario", label: "Scenario", kind: "select", options: SCENARIOS, defaultValue: p?.scenario ?? "draft" },
    { name: "budget", label: "Budget (USD)", kind: "number", required: true, defaultValue: p ? String(p.budget) : undefined },
    { name: "plannedSpend", label: "Planned spend (USD)", kind: "number", defaultValue: p?.plannedSpend != null ? String(p.plannedSpend) : undefined },
    { name: "expectedReturn", label: "Expected return (USD)", kind: "number", defaultValue: p?.expectedReturn != null ? String(p.expectedReturn) : undefined },
    { name: "targetLeads", label: "Target leads", kind: "number", defaultValue: p?.targetLeads != null ? String(p.targetLeads) : undefined },
    { name: "targetRevenue", label: "Target revenue (USD)", kind: "number", defaultValue: p?.targetRevenue != null ? String(p.targetRevenue) : undefined },
    { name: "strategy", label: "Channel strategy", kind: "textarea", rows: 2, defaultValue: p?.strategy ?? undefined },
    { name: "assumptions", label: "Assumptions", kind: "textarea", rows: 2, defaultValue: p?.assumptions ?? undefined },
  ];
  const create = (cls: string, text: string) => <FormDialog title="Add Channel Allocation" label={text} className={cls} action={saveChannelPlan} disabled={!canEdit} submitLabel="Save allocation" fields={fields()} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Channel Plan & Budget" subtitle="Plan channel mix, budget allocation, targets, and expected returns in one governed workspace." actions={create(headerPrimary, "Create Channel Plan")} />
      <MetricCards
        items={[
          { label: "Plan Budget", value: money(budget), caption: has ? `${plans.length} channel allocations` : "No plan" },
          { label: "Planned Spend", value: money(planned), caption: planned != null ? "Sum of planned spend" : "No plan" },
          { label: "Actual Spend", value: money(actual), caption: actual != null ? "Recorded on campaigns" : "No source data" },
          { label: "Expected Return", value: money(ret), caption: ret != null ? "Sum of expected returns" : "No forecast" },
        ]}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="One row per channel" action={has ? create("text-[12px] font-semibold text-[#0B5CFF]", "+ Add channel") : undefined}>Channel Allocation</PanelTitle>
          {has ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Channel", "Budget", "Planned", "Return", "Status", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2"><div className="font-semibold text-deep-navy">{label(PLAN_CHANNELS, p.channel)}</div><div className="text-[11px] text-ink-muted">{label(SCENARIOS, p.scenario)}</div></td>
                      <td className="px-3 py-2 text-ink-soft">{money(p.budget)}</td>
                      <td className="px-3 py-2 text-ink-soft">{money(p.plannedSpend) ?? "—"}</td>
                      <td className="px-3 py-2 text-ink-soft">{money(p.expectedReturn) ?? "—"}</td>
                      <td className="px-3 py-2"><Pill tone={p.approvalStatus === "approved" ? "green" : p.approvalStatus === "pending" ? "amber" : p.approvalStatus === "changes_requested" ? "red" : "gray"}>{label(APPROVAL_STATUSES, p.approvalStatus)}</Pill></td>
                      <td className="px-3 py-2">
                        {canEdit && (p.approvalStatus !== "approved" || !["EDITOR"].includes(c?.role ?? "")) && (
                          <span className="flex justify-end gap-1.5">
                            <FormDialog title={`Edit ${label(PLAN_CHANNELS, p.channel)}`} label="Edit" className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft" action={saveChannelPlan} submitLabel="Save allocation" fields={fields(p)} />
                            <ActButton action={deleteChannelPlan.bind(null, p.id)} confirm="Remove this allocation?">Remove</ActButton>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={CircleDot} title="No channel plan yet" body="Add channels and budget allocations to build a scenario." action={create(outlineSm, "Create Plan")} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Share of total budget">Budget Distribution</PanelTitle>
          {has && budget ? (
            <BarList rows={plans.map((p) => [label(PLAN_CHANNELS, p.channel), p.budget] as [string, number])} format={(n) => `${money(n)} · ${Math.round((n / budget) * 100)}%`} />
          ) : (
            <EmptyState icon={CircleDot} title="No distribution available" body="Budget distribution will appear after allocations are entered." />
          )}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Across allocations">Scenario</PanelTitle>
          <KeyList
            rows={[
              ["Scenario", <strong key="s" className="text-deep-navy">{scenarios.length ? scenarios.map((s) => label(SCENARIOS, s)).join(", ") : "Draft"}</strong>],
              ["Forecast", money(ret) ?? "—"],
              ["Assumptions", plans.filter((p) => p.assumptions).length ? `${plans.filter((p) => p.assumptions).length} documented` : "—"],
            ]}
          />
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Totals of channel targets">Targets</PanelTitle>
          <KeyList
            rows={[
              ["Leads", total("targetLeads")?.toLocaleString("en-US") ?? "—"],
              ["Revenue", money(total("targetRevenue")) ?? "—"],
              ["ROI / ROAS", ret != null && planned ? `${(ret / planned).toFixed(2)}x` : "—"],
            ]}
          />
        </section>
        <section className={giPanel}>
          <PanelTitle
            hint="Admins approve submitted plans"
            action={
              has ? (
                <span className="flex gap-1.5">
                  {canEdit && (approval === "not_submitted" || approval === "changes_requested") && <ActButton action={submitChannelPlan} className="text-[#0B5CFF]">Submit</ActButton>}
                  {c?.isAdmin && approval === "pending" && (
                    <>
                      <ActButton action={reviewChannelPlan.bind(null, "approved")} className="text-emerald-700">Approve</ActButton>
                      <ActButton action={reviewChannelPlan.bind(null, "changes_requested")}>Request changes</ActButton>
                    </>
                  )}
                </span>
              ) : undefined
            }
          >
            Approval
          </PanelTitle>
          <KeyList
            rows={[
              ["Status", <strong key="a" className={cn("text-deep-navy", approval === "approved" && "text-emerald-700")}>{label(APPROVAL_STATUSES, approval)}</strong>],
              ["Approver", approverId ? members.find((m) => m.id === approverId)?.name ?? "Former member" : "—"],
              ["Locked Fields", <strong key="l" className="text-deep-navy">{locked ? `${locked} approved allocations` : "None"}</strong>],
            ]}
          />
        </section>
      </div>
    </div>
  );
}
