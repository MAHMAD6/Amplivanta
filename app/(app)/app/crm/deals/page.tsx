import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Filter, LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { StatusPill, Avatar, CompanyIcon } from "@/components/amplivanta/status-pill";
import { PIPELINE_STAGES, STAGE_TONE, type DealStage, type Deal } from "@/lib/crm-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { dealFields } from "@/components/amplivanta/crm/crm-fields";
import { loadDeals, loadStageOptions } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Deals" };
export const dynamic = "force-dynamic";

const STAGES_ORDER: DealStage[] = ["New", "Qualified", "Proposal", "Negotiation", "Won"];

export default async function DealsBoardPage() {
  const [{ items: allDeals, live }, stageOptions] = await Promise.all([loadDeals(), loadStageOptions()]);
  const byStage: Record<string, Deal[]> = {};
  for (const s of STAGES_ORDER) byStage[s] = allDeals.filter((d) => d.stage === s);
  const DEAL_FIELDS = dealFields(stageOptions);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Deals Pipeline"
        subtitle="Drag stages, forecast revenue, log activity — one view for the whole team."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">
              <Filter className="h-3.5 w-3.5" /> All Owners
            </button>
            <ResourceDialog
              title="New Deal"
              description="Create a deal in your pipeline."
              fields={DEAL_FIELDS}
              endpoint="/api/deals"
              submitLabel="Create deal"
              successMessage="Deal created"
              trigger={
                <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
                  <Plus className="h-3.5 w-3.5" /> New Deal
                </button>
              }
            />
          </>
        }
      />
      <CrmSubnav />
      {live && <LiveBadge label={`Live · ${allDeals.length} deals from database`} />}

      <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-2 md:grid-cols-2 lg:grid-cols-5">
        {STAGES_ORDER.map((stage) => {
          const stageMeta = PIPELINE_STAGES.find((p) => p.key === stage)!;
          const deals = byStage[stage];
          return (
            <div key={stage} className="min-w-[240px] rounded-2xl border border-line bg-bg-soft/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusPill tone={STAGE_TONE[stage]}>{stage}</StatusPill>
                  <span className="text-[11px] font-bold text-ink">{deals.length}</span>
                </div>
                <span className="text-[10.5px] text-ink-muted">${stageMeta.value.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {deals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/app/crm/deals/${d.id}`}
                    className="block rounded-xl border border-line bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:border-violet/30"
                  >
                    <div className="text-[13px] font-semibold text-ink">{d.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <CompanyIcon name={d.company} size={20} />
                      <span className="text-[11px] text-ink-soft">{d.company}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-emerald-600">${d.value.toLocaleString()}</span>
                      <span className="text-[10px] text-ink-muted">{d.probability}%</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                      <Avatar name={d.owner} size={20} />
                      <span className="text-[10px] text-ink-muted">Close {d.expectedClose.split(",")[0]}</span>
                    </div>
                  </Link>
                ))}
                <ResourceDialog
                  title="New Deal"
                  description={`Add a deal to the ${stage} stage.`}
                  fields={DEAL_FIELDS}
                  endpoint="/api/deals"
                  submitLabel="Create deal"
                  successMessage="Deal created"
                  trigger={
                    <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-line py-2 text-[11.5px] font-semibold text-ink-muted hover:border-violet/40 hover:text-violet">
                      <Plus className="h-3 w-3" /> Add deal
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
