import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Copy, Pause, MoreHorizontal, Archive } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { EMAILS, EMAIL_STATUS_TONE } from "@/lib/marketing-auto-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { EMAIL_CAMPAIGN_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Email Campaigns — Amplivanta" };

export default function EmailCampaignsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Email Campaigns"
        subtitle="Broadcasts and automated email campaigns — one queue."
        actions={
          <CreateButton label="Email" buttonText="New Email" title="New Email Campaign" fields={EMAIL_CAMPAIGN_FIELDS} endpoint="/api/email-campaigns" />
        }
      />
      <MarketingSubnav />

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Sent", "Scheduled", "Draft", "Sending"].map((f, i) => (
          <button key={f} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{f}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3 text-right">Open Rate</th>
              <th className="px-4 py-3 text-right">CTR</th>
              <th className="px-4 py-3 text-right">Conversions</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-ink">{e.name}</div>
                  <div className="truncate text-[11px] text-ink-muted">{e.subject}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[12.5px] text-ink">{e.audience}</div>
                  <div className="text-[10.5px] text-ink-muted">{e.audienceSize.toLocaleString()} recipients</div>
                </td>
                <td className="px-4 py-3"><StatusPill tone={EMAIL_STATUS_TONE[e.status]}>{e.status}</StatusPill></td>
                <td className="px-4 py-3 text-[12px] text-ink-muted">{e.sent || e.scheduled || "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-ink">{e.openRate ? `${e.openRate}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{e.ctr ? `${e.ctr}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">{e.conversions || "—"}</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Copy className="h-3.5 w-3.5" /></button>
                    <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
