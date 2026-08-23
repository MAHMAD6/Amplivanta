import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MoreHorizontal, Copy, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { FORMS, FORM_STATUS_TONE } from "@/lib/marketing-auto-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { FORM_FIELDS } from "@/components/amplivanta/crud/module-fields";
import { ClipboardList, TrendingUp, ShieldCheck, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Lead Capture Forms — Amplivanta" };

export default function FormsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Lead Capture Forms"
        subtitle="Conversion-focused forms with explicit compliance and workflow integration."
        actions={
          <CreateButton label="Form" fields={FORM_FIELDS} endpoint="/api/forms" />
        }
      />
      <MarketingSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ClipboardList} label="Total Forms" value={String(FORMS.length)} tone="violet" />
        <KpiCard icon={Activity} label="Submissions (30d)" value="5.4K" delta="18%" tone="blue" />
        <KpiCard icon={TrendingUp} label="Avg. Conv. Rate" value="12.6%" delta="1.4 pts" tone="green" />
        <KpiCard icon={ShieldCheck} label="Compliant" value="100%" delta="Consent enforced" tone="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {FORMS.map((f) => (
          <div key={f.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-bold text-ink">{f.name}</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">{f.fields} fields · Updated {f.updatedAt}</div>
              </div>
              <StatusPill tone={FORM_STATUS_TONE[f.status]}>{f.status}</StatusPill>
            </div>
            <div className="grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
              <div>
                <div className="text-[10.5px] text-ink-muted">Submissions</div>
                <div className="text-[15px] font-bold text-ink">{f.submissions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-ink-muted">Conv. Rate</div>
                <div className="text-[15px] font-bold text-emerald-600">{f.conversionRate}%</div>
              </div>
              <div>
                <div className="text-[10.5px] text-ink-muted">Fields</div>
                <div className="text-[15px] font-bold text-ink">{f.fields}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[11.5px]">
              {f.workflow && <div className="flex items-center justify-between"><span className="text-ink-muted">Workflow</span><span className="font-semibold text-ink">{f.workflow}</span></div>}
              {f.page && <div className="flex items-center justify-between"><span className="text-ink-muted">Page</span><span className="font-semibold text-ink">{f.page}</span></div>}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl border border-line py-2 text-[12px] font-semibold text-ink">Edit</button>
              <button className="rounded-xl border border-line px-3 py-2 text-ink-muted"><Copy className="h-3.5 w-3.5" /></button>
              <button className="rounded-xl border border-line px-3 py-2 text-ink-muted"><ExternalLink className="h-3.5 w-3.5" /></button>
              <button className="rounded-xl border border-line px-3 py-2 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
